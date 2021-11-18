const { DataTypes, QueryTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.addColumn('reports', 'modified_on', {
        allowNull: true,
        type: DataTypes.DATE
      }, { transaction: t })

      await queryInterface.sequelize.query('UPDATE reports SET modified_on = date::timestamp;', {
        transaction: t,
        type: QueryTypes.UPDATE
      })

      await Promise.all([
        queryInterface.changeColumn('reports', 'modified_on', {
          allowNull: false,
          type: DataTypes.DATE
        }, { transaction: t }),
        queryInterface.removeColumn('reports', 'date', { transaction: t })
      ])
    })
  },
  down: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.addColumn('reports', 'date', {
        allowNull: true,
        type: DataTypes.STRING(10)
      }, { transaction: t })

      await queryInterface.sequelize.query('UPDATE reports SET date = modified_on::date;', {
        transaction: t,
        type: QueryTypes.UPDATE
      })

      await Promise.all([
        queryInterface.changeColumn('reports', 'date', {
          allowNull: false,
          type: DataTypes.STRING(10)
        }, { transaction: t }),
        queryInterface.removeColumn('reports', 'modified_on', { transaction: t })
      ])
    })
  }
}
