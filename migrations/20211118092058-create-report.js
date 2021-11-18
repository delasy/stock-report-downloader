const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('reports', {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      company_id: {
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        references: {
          model: 'companies',
          key: 'id'
        },
        type: DataTypes.UUID
      },
      year: {
        allowNull: false,
        type: DataTypes.SMALLINT
      },
      quarter: {
        allowNull: false,
        type: DataTypes.SMALLINT
      },
      date: {
        allowNull: false,
        type: DataTypes.STRING(10)
      },
      url: {
        allowNull: false,
        type: DataTypes.TEXT
      },
      revenue: {
        allowNull: false,
        defaultValue: 0,
        type: DataTypes.FLOAT
      },
      gross_profit: {
        allowNull: false,
        defaultValue: 0,
        type: DataTypes.FLOAT
      },
      operating_profit: {
        allowNull: false,
        defaultValue: 0,
        type: DataTypes.FLOAT
      },
      net_income: {
        allowNull: false,
        defaultValue: 0,
        type: DataTypes.FLOAT
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
    await queryInterface.dropTable('reports')
  }
}
