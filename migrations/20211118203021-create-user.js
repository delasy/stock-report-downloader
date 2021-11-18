const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      telegram_id: {
        allowNull: false,
        type: DataTypes.BIGINT,
        unique: true
      },
      username: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
      first_name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      last_name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      lang: {
        allowNull: false,
        type: DataTypes.STRING(2)
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE
      }
    })
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users')
  }
}
