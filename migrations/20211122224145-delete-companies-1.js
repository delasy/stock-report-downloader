const { v4: uuidv4 } = require('uuid')

const companies = [
  { ticker: 'GME', name: 'GameStop Corp.' }
]

function genDeleteCompaniesExport (companies) {
  return {
    up: async (queryInterface) => {
      await queryInterface.bulkDelete('companies', {
        ticker: companies.map(it => it.ticker)
      })
    },
    down: async (queryInterface) => {
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
    }
  }
}

module.exports = {
  genDeleteCompaniesExport: genDeleteCompaniesExport,
  ...genDeleteCompaniesExport(companies)
}
