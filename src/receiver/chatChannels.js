// const NULL = require('mysql2/lib/constants/types').NULL

// for test
// TODO: 动态更新stations, 可以通过wss.clients或者其他手段更新监听。
// const stations = []

// let usersWsByStation = {}
const uuidv1 = require('uuid/v1')
const chat_history = require('../table_modules/chat_history')
// const channel = require('../table_modules/channel')
const sockets = {}
// var users = {}

const chatChannelsReceiver = function (ws, user) {
  // TODO: 考虑从ws中获取其加入的广播站
  let key = null
  let i = 0
  ws.on('message', function (message) {
    // 处理频道列表
    console.log(`服务器接收到： ${message.data}`)
    let msg = JSON.parse(message.data)
    key = msg.data.channel.id // 进入的频道id
    if (!sockets[key]) { // 如果频道列表中没有该频道，在频道列表中创建频道
      sockets[key] = []
    }

    // 对不同类型的信息，做出不同响应
    var backMessage = null
    if (msg.type === 'chat-subsribe') { // 进入频道
      backMessage = {
        uuid: uuidv1(),
        source: 'wuanlife_websocket',
        type: 'chat-subsribe-ok',
        data: {
          channel: {
            id: key
          }
        }
      }
      ws.send(JSON.stringify(backMessage))
    }
    if (msg.type === 'chat-send') { // 发送信息
      backMessage = {
        uuid: uuidv1(),
        source: 'wuanlife_websocket',
        type: 'chat-send-ok',
        data: {
          channel: {
            id: key
          },
          content: msg.data.content
        }
      };
      (async () => {
        await chat_history.create({
          id: backMessage.uuid,
          sender_id: user.id || null,
          channel_id: key,
          content: msg.data.content,
          create_at: new Date()
        })
      })()
      ws.send(JSON.stringify(backMessage))
    }

    sockets[key].forEach((val) => { // 通知频道中的每个连接
      val.send(JSON.stringify({
        uuid: uuidv1(),
        source: 'wuanlife_websocket',
        type: 'chat-receive',
        data: {
          channel: {
            id: key
          },
          type: 'message', // 不同type的data结构不一样，方便后面扩展用的字段
          sender: {
            id: user.id,
            name: user.name
          },
          content: msg.data.content
        },
        created_at: new Date()
      }))
    })

    if (sockets[key].indexOf(ws) < 0) {
      sockets[key].push(ws) // 将此连接加入频道中
      i = sockets[key].length - 1 // i 表示此链接在频道中的位置，便于以后删除
    }
  })
  ws.on('disconnect', () => {
    sockets[key].splice(i, 1)
    // console.log(sockets)
  })
  // ws.of('chat').on('login', (username) => {
  //   if (username === 'system' || usersWsByStation[username] && usersWsByStation[username] !== ws) {
  //     throw new Error(`Username '${username}' is taken!`)
  //   } else {
  //     for (var i in usersWsByStation) {
  //       usersWsByStation[i].of('chat').emit('message', 'system', `欢迎${username}加入`)
  //     }
  //     ws.set('username', username)
  //     usersWsByStation[username] = ws
  //   }
  // })
  // ws.of('chat').on('message', (msg) => {
  //   var username = ws.get('username')
  //   if (username) {
  //     for (var i in usersWsByStation) {
  //       usersWsByStation[i].of('chat').emit('message', username, msg)
  //     }
  //   } else {
  //     throw new Error('Please log in first!')
  //   }
  // })
  // for (let station of stations) {
  //   usersWsByStation[station] = []
  //   ws.of(`chat-${station.id}`).on('login', (msg) => {
  //     usersWsByStation[station].push(ws)
  //     for (let userWs of usersWsByStation[station]) {
  //       userWs.of(`chat-${station.id}`).emit('message', {
  //         sender: {
  //           type: 'system'
  //         },
  //         receiver: {
  //           type: 'station',
  //           id: station.id
  //         },
  //         date: new Date(),
  //         message: {
  //           content: `欢迎 ${ws} 加入 ${station.name}`
  //         }
  //       })
  //     }
  //   })
  //   ws.of(`chat-${station.id}`).on('message', (msg) => {
  //     for (let userWs of usersWsByStation[station]) {
  //       userWs.of(`chat-${station.id}`).emit('message', {
  //         sender: {
  //           type: 'user',
  //           id: '',
  //           name: ''
  //         },
  //         receiver: {
  //           type: 'station',
  //           id: station.id
  //         },
  //         date: new Date(),
  //         message: {
  //           content: `${msg.content}`
  //         }
  //       })
  //     }
  //   })
  //   // TODO: 离开广播站或者掉线时垃圾回收。
  // }
}

module.exports = chatChannelsReceiver
