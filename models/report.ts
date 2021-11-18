import type {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  Optional
} from 'sequelize'
import { DataTypes, Model } from 'sequelize'

import Company from './company'
import sequelize from '../config/sequelize'
import { yearQuarter } from '../utils'

interface ReportAttributes {
  readonly id: string
  companyId: string
  year: number
  quarter: number
  yearQuarter: string
  url: string
  revenue: number
  grossProfit: number
  operatingProfit: number
  netIncome: number
  modifiedOn: Date
}

interface ReportCreationAttributes extends Optional<ReportAttributes, 'id' | 'yearQuarter'> {
}

class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
  public readonly id!: string
  public companyId!: string
  public year!: number
  public quarter!: number
  public url!: string
  public revenue!: number
  public grossProfit!: number
  public operatingProfit!: number
  public netIncome!: number
  public modifiedOn!: Date

  public yearQuarter!: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  public createCompany!: BelongsToCreateAssociationMixin<Company>
  public getCompany!: BelongsToGetAssociationMixin<Company>
  public setCompany!: BelongsToSetAssociationMixin<Company, string>

  public readonly company?: Company

  public static associations: {
    company: Association<Report, Company>
  }
}

Report.init({
  id: {
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    type: DataTypes.UUID
  },
  companyId: {
    allowNull: false,
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
  url: {
    allowNull: false,
    type: DataTypes.TEXT
  },
  revenue: {
    allowNull: false,
    type: DataTypes.BIGINT
  },
  grossProfit: {
    allowNull: false,
    type: DataTypes.BIGINT
  },
  operatingProfit: {
    allowNull: false,
    type: DataTypes.BIGINT
  },
  netIncome: {
    allowNull: false,
    type: DataTypes.BIGINT
  },
  modifiedOn: {
    allowNull: false,
    type: DataTypes.DATE
  },
  yearQuarter: {
    type: DataTypes.VIRTUAL,
    get () {
      return yearQuarter(this.year, this.quarter)
    },
    set (_) {
      throw new Error('Tried setting yearQuarter field')
    }
  }
}, {
  modelName: 'report',
  sequelize: sequelize
})

export default Report
