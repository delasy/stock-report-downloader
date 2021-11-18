import Company from './company'
import Report from './report'
import User from './user'

Company.hasMany(Report)
Report.belongsTo(Company)

export {
  Company,
  Report,
  User
}
