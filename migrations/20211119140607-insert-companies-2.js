const { genInsertCompaniesExport } = require('./20211118161407-insert-companies-1')

const companies = [
  { ticker: 'ADSK', name: 'Autodesk, Inc.' },
  { ticker: 'DELL', name: 'Dell Technologies Inc.' },
  { ticker: 'GME', name: 'GameStop Corp.' },
  { ticker: 'HPQ', name: 'HP Inc.' },
  { ticker: 'VMW', name: 'VMware, Inc.' },
  { ticker: 'ZM', name: 'Zoom Video Communications, Inc.' }
]

module.exports = genInsertCompaniesExport(companies)
