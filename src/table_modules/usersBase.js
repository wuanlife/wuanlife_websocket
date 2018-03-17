const db = require('./db')
const Sequelize = require('sequelize')

let usersBase = db.define('users_base', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true
  },
  mail: Sequelize.STRING(30),
  password: Sequelize.STRING(32),
  name: Sequelize.STRING(20),
  create_at: {
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'users_base'
})

module.exports = usersBase
