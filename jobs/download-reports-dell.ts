import axios from 'axios'
import cheerio from 'cheerio'

import type { DownloadReportsInfo, DownloadReportsData } from '../middlewares/download-reports'
import { downloadReportsMiddleware, getReportModifiedOn } from '../middlewares/download-reports'
import { getUserAgent, yearQuarter } from '../utils'

async function downloadReportsInfo (): Promise<DownloadReportsInfo[]> {
  const res = await axios.get('https://investors.delltechnologies.com/financial-information/quarterly-results', {
    headers: {
      'user-agent': getUserAgent()
    }
  })

  const $ = cheerio.load(res.data)
  const info: DownloadReportsInfo[] = []

  $('.view-content .view-grouping').each((_, yearGroupEl) => {
    const $yearGroup = $(yearGroupEl)
    const yearText = $yearGroup.find('h2').text().trim()
    const year = parseInt(yearText)

    if (isNaN(year)) {
      throw new Error(`Incomplete DELL report (year: ${yearText})`)
    }

    $yearGroup.find('.acc-title').each((_, quarterEl) => {
      const $quarter = $(quarterEl)
      const quarterText = $quarter.text().trim().slice(1)
      const quarter = parseInt(quarterText)

      if (isNaN(quarter)) {
        throw new Error(`Incomplete DELL ${yearText} report (quarter: ${quarterText})`)
      }

      const url = $quarter.next().find('a').eq(2).attr('href')

      if (typeof url === 'undefined' || url === '') {
        throw new Error(`Incomplete DELL ${yearQuarter(year, quarter)} report`)
      }

      info.push({ year, quarter, url })
    })
  })

  return info
}

async function downloadReportsData (_info: DownloadReportsInfo): Promise<DownloadReportsData> {
  return {
    revenue: 0,
    grossProfit: 0,
    operatingProfit: 0,
    netIncome: 0
  }
}

export default downloadReportsMiddleware('DELL', downloadReportsInfo, getReportModifiedOn, downloadReportsData)
