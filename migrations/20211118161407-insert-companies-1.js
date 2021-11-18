const { v4: uuidv4 } = require('uuid')

const companies = [
  { ticker: 'AAPL', name: 'Apple Inc.' }
]

function genInsertCompaniesExport (companies) {
  return {
    up: async (queryInterface) => {
      const now = new Date()

      const data = companies.map((company) => {
        return {
          ...company,
          id: uuidv4(),
          created_at: now,
          updated_at: now
        }
      })

      await queryInterface.bulkInsert('companies', data)
    },
    down: async (queryInterface) => {
      await queryInterface.bulkDelete('companies', {
        ticker: companies.map(it => it.ticker)
      })
    }
  }
}

module.exports = {
  genInsertCompaniesExport: genInsertCompaniesExport,
  ...genInsertCompaniesExport(companies)
}
