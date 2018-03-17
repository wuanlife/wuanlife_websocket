'use strict'
const WebSocketChannel = require('./channel')

class WebSocketWrapper extends WebSocketChannel {
  constructor (socket, options) {
    // Make `this` a WebSocketChannel
    super()
    this._wrapper = this
    options = options || {}
    if (typeof options.debug === 'function') {
      this._debug = options.debug
    } else if (options.debug === true) {
      this._debug = console.log.bind(console)
    } else {
      this._debug = () => {} // no-op
    }
    if (typeof options.errorToJSON !== 'function') {
      this._errorToJSON = (err) => {
        if (typeof window === 'undefined') {
          return JSON.stringify({'message': err.message})
        } else {
          return JSON.stringify(err,
            Object.getOwnPropertyNames(err))
        }
      }
    } else {
      this._errorToJSON = options.errorToJSON
    }
    if (options.requestTimeout > 0) { this._requestTimeout = options.requestTimeout | 0 }

    // Flag set once the socket is opened
    this._opened = false
    // Array of data to be sent once the connection is opened
    this._pendingSend = []
    // Incrementing request ID counter for this WebSocket
    this._lastRequestId = 0
    /* Object of pending requests; keys are the request ID, values are
			Objects containing `resolve` and `reject` functions used to
			resolve the request's Promise. */
    this._pendingRequests = {}
    /* Object of WebSocketChannels (except `this` associated with this
			WebSocket); keys are the channel name. */
    this.channels = {}
    // Object containing user-assigned socket data
    this.data = {}
    // Bind this wrapper to the `socket` passed to the constructor
    this.socket = null
    if (socket && socket.constructor) {
      this.bind(socket)
    }
  }

  bind (socket) {
    // Save the `socket` and add event listeners
    this.socket = socket
    socket.onopen = (event) => {
      this._opened = true
      this._debug('socket: onopen')
      // Send all pending messages
      for (var i = 0; i < this._pendingSend.length; i++) {
        if (this.isConnected) {
          this._debug('wrapper: Sending pending message:',
            this._pendingSend[i])
          this.socket.send(this._pendingSend[i])
        } else {
          break
        }
      }
      this._pendingSend = this._pendingSend.slice(i)
      this.emit('open', event)
    }
    socket.onmessage = (event) => {
      this._debug('socket: onmessage', event.data)
      this.emit('message', event, event.data)
      this._onMessage(event.data)
    }
    socket.onerror = (event) => {
      this._debug('socket: onerror', event)
      this.emit('error', event)
    }
    socket.onclose = (event) => {
      var opened = this._opened
      this._opened = false
      this._debug('socket: onclose', event)
      this.emit('close', event, opened)
      this.emit('disconnect', event, opened)
    }
    // If the socket is already open, send all pending messages now
    if (this.isConnected) {
      socket.onopen()
    }
  }

  // Rejects all pending requests and then clears the send queue
  abort () {
    for (var id in this._pendingRequests) {
      this._pendingRequests[id].reject(new Error('Request was aborted'))
    }
    this._pendingRequests = {}
    this._pendingSend = []
  }

  // Returns a channel with the specified `namespace`
  of (namespace) {
    if (namespace == null) {
      return this
    }
    if (!this.channels[namespace]) {
      this.channels[namespace] = new WebSocketChannel(namespace, this)
    }
    return this.channels[namespace]
  }

  get isConnecting () {
    return this.socket && this.socket.readyState ===
      this.socket.constructor.CONNECTING
  }

  get isConnected () {
    return this.socket && this.socket.readyState ===
      this.socket.constructor.OPEN
  }

  send (data, ignoreMaxQueueSize) {
    if (this.isConnected) {
      this._debug('wrapper: Sending message:', data)
      this.socket.send(data)
    } else if (ignoreMaxQueueSize ||
      this._pendingSend.length < WebSocketWrapper.MAX_SEND_QUEUE_SIZE) {
      this._debug('wrapper: Queuing message:', data)
      this._pendingSend.push(data)
    } else {
      throw new Error('WebSocket is not connected and send queue is full')
    }
  }

  disconnect () {
    if (this.socket) { this.socket.close.apply(this.socket, arguments) }
  }

  // Called whenever the bound Socket receives a message
  _onMessage (msg) {
    try {
      msg = JSON.parse(msg)
      // If `msg` contains special ignore property, we'll ignore it
      if (msg['ws-wrapper'] === false) { return }
      if (msg.a) {
        var argsArray = []
        for (var i in msg.a) {
          argsArray[i] = msg.a[i]
        }
        msg.a = argsArray
      }
      /* If `msg` does not have an `a` Array with at least 1 element,
        ignore the message because it is not a valid event/request */
      if (msg.a instanceof Array && msg.a.length >= 1 &&
        (msg.c || WebSocketChannel.NO_WRAP_EVENTS.indexOf(msg.a[0]) < 0)) {
        // Process inbound event/request
        var event = {
          'name': msg.a.shift(),
          'args': msg.a
        }
        var channel = msg.c == null ? this : this.channels[msg.c]
        if (!channel) {
          this._debug(`wrapper: Event '${event.name}' ignored ` +
              `because channel '${msg.c}' does not exist.`)
        } else if (channel._emitter.emit(event.name, event)) {
          this._debug(`wrapper: Event '${event.name}' sent to ` +
            'event listener')
        } else {
          this._debug(`wrapper: Event '${event.name}' had no ` +
            'event listener')
        }
      } else if (this._pendingRequests[msg.i]) {
        this._debug('wrapper: Processing response for request', msg.i)
        // Process response to prior request
        if (msg.e !== undefined) {
          var err = msg.e
          // `msg._` indicates that `msg.e` is an Error
          if (msg._ && err) {
            err = new Error(err.message)
            // Copy other properties to Error
            for (var key in msg.e) {
              err[key] = msg.e[key]
            }
          }
          this._pendingRequests[msg.i].reject(err)
        } else {
          this._pendingRequests[msg.i].resolve(msg.d)
        }
        clearTimeout(this._pendingRequests[msg.i].timer)
        delete this._pendingRequests[msg.i]
      }
      // else ignore the message because it's not valid
    } catch (e) {
      // Non-JSON messages are ignored
      /* Note: It's also possible for uncaught exceptions from event
        handlers to end up here. */
    }
  }

  /* The following methods are called by a WebSocketChannel to send data
    to the Socket. */
  _sendEvent (channel, eventName, args, isRequest) {
    // Serialize data for sending over the socket
    var data = {'a': args}
    if (channel != null) {
      data.c = channel
    }
    // Send the message
    this.send(JSON.stringify(data))
    // Return the request, if needed
    return null
  }

  get (key) {
    return this.data[key]
  }

  set (key, value) {
    this.data[key] = value
  }
}

/* Maximum number of items in the send queue.  If a user tries to send more
  messages than this number while a WebSocket is not connected, errors will
  be thrown. */
WebSocketWrapper.MAX_SEND_QUEUE_SIZE = 10

module.exports = WebSocketWrapper
