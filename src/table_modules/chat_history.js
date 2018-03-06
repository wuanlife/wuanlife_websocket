const db = require('./db')
const Sequelize = require('sequelize')

let chat_history = db.define('chat_history', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true
  },
  sender_id: Sequelize.BIGINT,
  channel_id: Sequelize.STRING(30),
  content: Sequelize.STRING(300),
  create_at: Sequelize.BIGINT
}, {
  timestamps: false,
  tableName: 'chat_history'
})

module.exports = chat_history
