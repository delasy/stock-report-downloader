import axios from 'axios'

import { Company, Report, User } from '../models'
import { getUserAgent, yearQuarter } from '../utils'

export interface DownloadReportsInfo {
  year: number
  quarter: number
  url: string
  modifiedOn?: Date
}

export interface DownloadReportsData {
  revenue: number
  grossProfit: number
  operatingProfit: number
  netIncome: number
}

export async function getReportModifiedOn (_: string, url: string): Promise<Date> {
  const res = await axios.head(url, {
    headers: {
      'user-agent': getUserAgent()
    }
  })

  const modifiedOn = res.headers['last-modified']

  if (typeof modifiedOn === 'undefined') {
    throw new Error(`Last modified not present when requesting ${url}`)
  }

  return new Date(modifiedOn)
}

export async function getReportModifiedOnEmpty (yearQuarter: string, _: string): Promise<Date> {
  const quarter = yearQuarter.slice(5)

  if (quarter === 'Q4') {
    return new Date(`${yearQuarter.slice(0, 4)}-12-31`)
  } else if (quarter === 'Q3') {
    return new Date(`${yearQuarter.slice(0, 4)}-09-30`)
  } else if (quarter === 'Q2') {
    return new Date(`${yearQuarter.slice(0, 4)}-06-30`)
  } else {
    return new Date(`${yearQuarter.slice(0, 4)}-03-31`)
  }
}

export function downloadReportsMiddleware (
  ticker: string,
  infoFn: () => Promise<DownloadReportsInfo[]>,
  modifiedOnFn: (yearQuarter: string, url: string) => Promise<Date>,
  dataFn: (info: DownloadReportsInfo) => Promise<DownloadReportsData>
) {
  return async (): Promise<void> => {
    const company = await Company.findOne({
      where: { ticker }
    })

    if (company === null) {
      throw new Error(`No company found with ticker "${ticker}"`)
    }

    const [info, reports] = await Promise.all([
      infoFn(),
      company.getReports()
    ])

    const hasReports = reports.length !== 0

    await Promise.all(
      info.map(async (item) => {
        let report = reports.find(it => it.year === item.year && it.quarter === item.quarter)

        if (typeof report === 'undefined') {
          const data = await dataFn(item)
          const modifiedOn = await modifiedOnFn(yearQuarter(item.year, item.quarter), item.url)

          report = await Report.create({
            companyId: company.id,
            year: item.year,
            quarter: item.quarter,
            url: item.url,
            revenue: data.revenue,
            grossProfit: data.grossProfit,
            operatingProfit: data.operatingProfit,
            netIncome: data.netIncome,
            modifiedOn: modifiedOn
          })

          if (hasReports) {
            await User.telegramBroadcast(`${company.name} added report ${report.yearQuarter}`)
          }
        } else if (report.url !== item.url) {
          const data = await dataFn(item)
          const modifiedOn = await modifiedOnFn(yearQuarter(item.year, item.quarter), item.url)

          await report.update({
            url: item.url,
            revenue: data.revenue,
            grossProfit: data.grossProfit,
            operatingProfit: data.operatingProfit,
            netIncome: data.netIncome,
            modifiedOn: modifiedOn
          })

          await User.telegramBroadcast(`${company.name} changed report ${report.yearQuarter}`)
          // TODO Store changes to DB table
        }
      })
    )
  }
}
