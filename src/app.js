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
    console.log('[verifyClient] start validate')
    // 如果token过期会爆TokenExpiredError
    if (token) {
      try {
        user = jwt.verify(token, publicKey)
        console.log(`[verifyClient] user ${user.name} logined`)
      } catch (e) {
        console.log('[verifyClient] token expired')
        return false
      }
    }

    // verify token and parse user object
    if (user) {
      info.req.user = user
      return true
    } else {
      info.req.user = {
        name: `游客${parseInt(Math.random() * 1000000)}`,
        mail: ''
      }
      return true
    }
  }
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
