// const path = require('path')

// 系统配置
const System = {
  WEBSOCKET_server_host: 'localhost', // API服务器暴露的域名地址,请勿添加"http://"
  WEBSOCKET_server_port: '8089', // API服务器监听的端口号
  HTTP_server_type: 'http://', // HTTP服务器协议类型,包含"http://"或"https://"
  HTTP_server_host: 'localhost', // HTTP服务器地址,请勿添加"http://" （即前端调用使用的服务器地址，如果是APP请设置为 * ）
  HTTP_server_port: '8090', // HTTP服务器端口号
  System_country: 'zh-cn', // 所在国家的国家代码
  // System_plugin_path: path.join(__dirname, './plugins'), // 插件路径
  db_type: 'mysql' // 数据库类型
}

const DB = {
  // url: 'mongodb://localhost/e-civ'
  host: 'localhost',
  username: 'wuanlife_websocket',
  password: 'fuckfuck',
  database: 'wuanlife'
}

module.exports = {
  System,
  DB
}
