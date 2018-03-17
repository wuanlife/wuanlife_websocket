const db = require('./db')
const Sequelize = require('sequelize')

let channel = db.define('channel', {
  id: {
    type: Sequelize.STRING(30),
    primaryKey: true
  },
  name: Sequelize.STRING(20),
  meta: Sequelize.STRING(3000)
}, {
  timestamps: false,
  tableName: 'channel'
})

module.exports = channel
