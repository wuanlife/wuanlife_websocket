const db = require('./db')
const Sequelize = require('sequelize')

let users_base = db.define('users_base', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true
  },
  mail: Sequelize.STRING(30),
  password: Sequelize.STRING(32),
  name: Sequelize.STRING(20),
  create_at: Sequelize.BIGINT
}, {
  timestamps: false,
  tableName: 'users_base'
})

module.exports = users_base
