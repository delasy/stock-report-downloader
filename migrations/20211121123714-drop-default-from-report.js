const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (t) => {
      await Promise.all([
        queryInterface.changeColumn('reports', 'revenue', {
          allowNull: false,
          type: DataTypes.FLOAT
        }, { transaction: t }),
        queryInterface.changeColumn('reports', 'gross_profit', {
          allowNull: false,
          type: DataTypes.FLOAT
        }, { transaction: t }),
        queryInterface.changeColumn('reports', 'operating_profit', {
          allowNull: false,
          type: DataTypes.FLOAT
        }, { transaction: t }),
        queryInterface.changeColumn('reports', 'net_income', {
          allowNull: false,
          type: DataTypes.FLOAT
        }, { transaction: t })
      ])
    })
  },
  down: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (t) => {
      await Promise.all([
        queryInterface.changeColumn('reports', 'revenue', {
          allowNull: false,
          defaultValue: 0,
          type: DataTypes.FLOAT
        }, { transaction: t }),
        queryInterface.changeColumn('reports', 'gross_profit', {
          allowNull: false,
          defaultValue: 0,
          type: DataTypes.FLOAT
        }, { transaction: t }),
        queryInterface.changeColumn('reports', 'operating_profit', {
          allowNull: false,
          defaultValue: 0,
          type: DataTypes.FLOAT
        }, { transaction: t }),
        queryInterface.changeColumn('reports', 'net_income', {
          allowNull: false,
          defaultValue: 0,
          type: DataTypes.FLOAT
        }, { transaction: t })
      ])
    })
  }
}
