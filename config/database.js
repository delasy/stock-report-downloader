require('./dotenv')

const commonConfig = {
  define: {
    underscored: true
  },
  dialect: 'postgres',
  migrationStoragePath: 'sequelize',
  migrationStorageTableName: 'sequelize_migrations',
  use_env_variable: 'DATABASE_URL'
}

module.exports = {
  development: {
    ...commonConfig
  },
  production: {
    ...commonConfig,
    dialectOptions: {
      keepAlive: true,
      ssl: {
        rejectUnauthorized: false,
        require: true
      }
    },
    logging: false,
    ssl: true
  }
}
