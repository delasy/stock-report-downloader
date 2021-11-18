const { Sequelize } = require('sequelize')

const config = require('./database')

module.exports = new Sequelize(
  process.env.DATABASE_URL,
  config[process.env.NODE_ENV ?? 'development']
)
