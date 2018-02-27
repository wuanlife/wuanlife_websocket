const db = require('./db')
const Sequelize = require('sequelize')

let channel = db.define('channel', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true
  },
  name: Sequelize.STRING(20),
  meta: Sequelize.STRING(3000)
}, {
  timestamps: false,
  tableName: 'channel'
})

module.exports = channel
