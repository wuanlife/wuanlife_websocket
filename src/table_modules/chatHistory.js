const db = require('./db')
const Sequelize = require('sequelize')

let chatHistory = db.define('chat_history', {
  id: {
    type: Sequelize.STRING(50),
    primaryKey: true
  },
  sender_id: Sequelize.BIGINT,
  channel_id: Sequelize.STRING(30),
  content: Sequelize.STRING(300),
  create_at: {
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'chat_history'
})

module.exports = chatHistory
