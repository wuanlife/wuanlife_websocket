const Sequelize = require('sequelize')
const DBConfig = require('../config').DB

let sequelize = new Sequelize(DBConfig.database, DBConfig.username, DBConfig.password, {
  host: DBConfig.host,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 30000
  }
})

module.exports = sequelize
