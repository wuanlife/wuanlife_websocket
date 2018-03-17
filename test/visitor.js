const WebSocket = require('ws')
const WebSocketWrapper = require('../src/wrapper/wrapper')

// 客户端测试
let ws1 = new WebSocket('ws://localhost:8089')
ws1 = new WebSocketWrapper(ws1)
ws1.on('open', function () {
  console.log('1open...')
  let message = JSON.stringify({
    type: 'chat-subsribe',
    data: {
      channel: {
        id: 41
      }
    }
  })
})
ws1.on('message', function (message) {
  console.log(`客户端1接收到：${message.data}`)
  if (JSON.parse(message.data).type === 'chat-subsribe-ok') {
    console.log(`[test] 测试游客收到加入聊天室成功`)
  }
})
