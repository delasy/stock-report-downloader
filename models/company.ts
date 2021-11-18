import type {
  Association,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyRemoveAssociationMixin,
  HasManySetAssociationsMixin,
  Optional
} from 'sequelize'
import { DataTypes, Model } from 'sequelize'

import Report from './report'
import sequelize from '../config/sequelize'

interface CompanyAttributes {
  readonly id: string
  ticker: string
  name: string
}

interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'id'> {
}

class Company extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
  public readonly id!: string
  public ticker!: string
  public name!: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  public addReport!: HasManyAddAssociationMixin<Report, string>
  public countReports!: HasManyCountAssociationsMixin
  public createReport!: HasManyCreateAssociationMixin<Report>
  public getReports!: HasManyGetAssociationsMixin<Report>
  public hasReport!: HasManyHasAssociationMixin<Report, string>
  public removeReport!: HasManyRemoveAssociationMixin<Report, string>
  public setReport!: HasManySetAssociationsMixin<Report, string>

  public readonly reports?: Report[]

  public static associations: {
    reports: Association<Company, Report>
  }
}

Company.init({
  id: {
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    type: DataTypes.UUID
  },
  ticker: {
    allowNull: false,
    type: DataTypes.STRING(5)
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING
  }
}, {
  modelName: 'company',
  sequelize: sequelize
})

export default Company
