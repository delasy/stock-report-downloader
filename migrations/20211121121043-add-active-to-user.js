const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('users', 'active', {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'active')
  }
}
