const WebSocket = require('ws')
const WebSocketWrapper = require('../src/wrapper/wrapper')

// 客户端测试
let ws1 = new WebSocket('ws://localhost:8089?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MjE4NjU0MjQsInVzZXJfaWQiOjc2fQ.8PInVl4olIr7F1Hcn2fiCif8jVF4hfYS1bGCaOY7mMQ')
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
  console.log(`客户端1发出：${message}`)
  ws1.send(message)
})
ws1.on('message', function (message) {
  console.log(`客户端1接收到：${message.data}`)
  if (JSON.parse(message.data).type === 'chat-subsribe-ok') {
    console.log(`客户端1发出： ${JSON.stringify({
      type: 'chat-send',
      data: {
        channel: {
          id: 41
        },
        content: '1111111111'
      }
    })}`)
    ws1.send(JSON.stringify({
      type: 'chat-send',
      data: {
        channel: {
          id: 41
        },
        content: '111111111'
      }
    }))
  }
})

// let ws2 = new WebSocket('ws://localhost:8089')
// ws2 = new WebSocketWrapper(ws2)
// ws2.on('open', function () {
//   console.log('2open...')
//   let message = JSON.stringify({
//     type: 'chat-subsribe',
//     data: {
//       channel: {
//         id: 4
//       }
//     }
//   })
//   console.log(`客户端2发出：${message}`)
//   ws2.send(message)
// })
// ws2.on('message', function (message) {
//   console.log(`客户端2接收到：${message.data}`)
//   if (JSON.parse(message.data).type === 'chat-subsribe-ok') {
//     console.log(`客户端2发出： ${JSON.stringify({
//       type: 'chat-send',
//       data: {
//         channel: {
//           id: 4
//         },
//         content: '2222222222'
//       }
//     })}`)
//     ws2.send(JSON.stringify({
//       type: 'chat-send',
//       data: {
//         channel: {
//           id: 4
//         },
//         content: '222222222'
//       }
//     }))
//   }
// })
