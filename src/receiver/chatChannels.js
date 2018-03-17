// const NULL = require('mysql2/lib/constants/types').NULL

// for test
// TODO: 动态更新stations, 可以通过wss.clients或者其他手段更新监听。
// const stations = []

let usersWsByChannel = {}
const uuidv1 = require('uuid/v1')
const chatHistory = require('../table_modules/chatHistory')
const channel = require('../table_modules/channel')
// var users = {}

const listenChannel = (ws, id) => {
  ws.of(`channel-${id}`).on('message', (message) => {
    logger.info(`[channel-${id}] received `, message)
  })
}

const chatChannelsReceiver = function (ws, user) {
  ws.on('message', function incoming ({data}) {
    const message = JSON.parse(data)
    if (message.type === 'chat-subsribe') {
      const { channel } = message.data
      if (usersWsByChannel[channel.id]) {
        usersWsByChannel[channel.id].push(ws)
      } else {
        usersWsByChannel[channel.id] = [ws]
      }
      logger.info(`[channel] user ${user.user_id} join channel ${message.data.channel.id} `, message)
      listenChannel(ws, message.data.channel.id)
      ws.send(JSON.stringify({
        'uuid': uuidv1(),
        'source': 'wuanlife_websocket',
        'type': 'chat-subsribe-ok',
        'data': {
          'channel': {
            'id': channel.id
          }
        }
      }))
    }
  })
  // TODO: 离开广播站或者掉线时垃圾回收。
}

module.exports = chatChannelsReceiver
