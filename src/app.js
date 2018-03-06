const SystemConfig = require('./config').System
const DBConfig = require('./config').DB
const path = require('path')
const url = require('url')
const WebSocket = require('ws')
const WebSocketWrapper = require('./wrapper/wrapper')
const receiver = require('./receiver')
const customizedLogger = require('./tool/customized-winston-logger')

const jwt = require('jsonwebtoken')
const fs = require('fs')
const mysql = require('mysql2')
const redis = require('redis')
const { promisify } = require('util')
const usersBase = require('./table_modules/users_base')

const setInterval = require('timers').setInterval

const publicKey = fs.readFileSync(path.join(__dirname, '../publicKey.pub'))
console.log(`publicKey: ${publicKey}`)
global.logger = customizedLogger

// 连接数据库
const connection = mysql.createConnection({
  host: DBConfig.host,
  user: DBConfig.username,
  password: DBConfig.password,
  database: DBConfig.database
})

const redisClient = redis.createClient()
const getAsync = promisify(redisClient.get).bind(redisClient)
const setAsync = promisify(redisClient.set).bind(redisClient)
const hsetAsync = promisify(redisClient.hset).bind(redisClient)
const hkeysAsync = promisify(redisClient.hkeys).bind(redisClient)

async function redisTest () {
  let res = null
  try {
    res = await setAsync('string key', 'string val')
  } catch (e) {
    console.log(e)
  }
  console.log(res)
}
redisTest().then()

// connection.query(`INSERT INTO chat_history (id, sender_id, channel_id, content) VALUES ('keke', '134', 'kekeke', 'wori')`, function (error, results, fields) {
//   if (error) throw error
//   // ...
// })

// const env = process.env.NODE_ENV || 'development' // Current mode

const wss = new WebSocket.Server({
  host: SystemConfig.WEBSOCKET_server_host,
  port: SystemConfig.WEBSOCKET_server_port,
  // 验证token识别身份
  verifyClient: (info) => {
    const token = url.parse(info.req.url, true).query.token
    let user
    console.log('start validate')
    // 如果token过期会爆TokenExpiredError
    try {
      user = jwt.verify(token, publicKey)
    } catch (e) {
      return false
    }

    // verify token and parse user object
    if (user) {
      info.req.user = user;
      (async () => { // 保存用户信息
        var userInfo = await usersBase.findAll({
          where: {
            name: user.name
          }
        })
        if (!userInfo.length) {
          await usersBase.create({
            name: user.name,
            mail: user.mail || '',
            password: user.password,
            create_at: new Date()
          })
        }
      })()
      return true
    } else {
      return false
    }
  }
  // perMessageDeflate: true,
})

// 心跳监测监测连接断连
function heartbeat (data) {
  this.isAlive = true
}

wss.on('connection', function connection (ws, req) {
  ws.isAlive = true
  ws.on('pong', heartbeat)
  // 带来一定隐患，比如事件机制不一样。。。
  ws = new WebSocketWrapper(ws)

  const user = req.user
  console.log(user)
  console.log('ws: /////////')
  // console.log(ws)

  // message handler receiver
  receiver.default(ws) // 主频道
  receiver.chatChannels(ws, user) // 聊天分频道
  ws.on('close', function close () {
    logger.log('disconnected')
  })
})

// 客户端测试
// let ws1 = new WebSocket('ws://localhost:8089?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYnVlciIsInBhc3N3b3JkIjoiMTIzNDU2IiwiaWF0IjoxNTE5NTUwOTUzLCJleHAiOjE1MjA0MTQ5NTN9.Oru04t1l6SgP1E9sc8qqFjOQ6q8xnUDNDdkGukauCH8&user={"name":"buer","password":"123456"}')
// ws1 = new WebSocketWrapper(ws1)
// ws1.on('open', function () {
//   console.log('1open...')
//   let message = JSON.stringify({
//     type: 'chat-subsribe',
//     data: {
//       channel: {
//         id: 41
//       }
//     }
//   })
//   console.log(`客户端1发出：${message}`)
//   ws1.send(message)
// })
// ws1.on('message', function (message) {
//   console.log(`客户端1接收到：${message.data}`)
//   if (JSON.parse(message.data).type === 'chat-subsribe-ok') {
//     console.log(`客户端1发出： ${JSON.stringify({
//       type: 'chat-send',
//       data: {
//         channel: {
//           id: 41
//         },
//         content: '1111111111'
//       }
//     })}`)
//     ws1.send(JSON.stringify({
//       type: 'chat-send',
//       data: {
//         channel: {
//           id: 41
//         },
//         content: '111111111'
//       }
//     }))
//   }
// })

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

setInterval(function ping () {
  wss.clients.forEach((ws) => {
    logger.info('heartbeat scan')
    if (ws.isAlive === false) {
      logger.info('loss connect')
      return ws.terminate()
    }

    ws.isAlive = false
    ws.ping('ping', false, false)
  })
}, 5000)
