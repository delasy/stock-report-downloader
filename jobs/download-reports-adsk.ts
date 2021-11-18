import axios from 'axios'
import cheerio from 'cheerio'

import type { DownloadReportsInfo, DownloadReportsData } from '../middlewares/download-reports'
import {
  downloadReportsMiddleware,
  getReportModifiedOn,
  getReportModifiedOnEmpty
} from '../middlewares/download-reports'
import { getUserAgent, yearQuarter } from '../utils'

async function downloadReportsInfo (): Promise<DownloadReportsInfo[]> {
  const res = await axios.get('https://investors.autodesk.com/financials/quarterly-results', {
    headers: {
      'user-agent': getUserAgent()
    }
  })

  const $ = cheerio.load(res.data)
  const info: DownloadReportsInfo[] = []

  $('.qr-year-nav .nav-item a').each((_, yearEl) => {
    const $year = $(yearEl)
    const yearText = $year.text().trim()
    const year = parseInt(yearText)

    if (isNaN(year)) {
      throw new Error(`Incomplete ADSK report (year: ${yearText})`)
    }

    $($year.attr('href')).find('.row > div').each((_, quarterEl) => {
      const $quarter = $(quarterEl)
      const quarterText = $quarter.find('h3').first().text().trim().slice(1)
      const quarter = parseInt(quarterText)

      if (isNaN(quarter)) {
        throw new Error(`Incomplete ADSK ${yearText} report (quarter: ${quarterText})`)
      }

      const url = $quarter.find('a').eq(1).attr('href')

      if (typeof url === 'undefined' || url === '') {
        throw new Error(`Incomplete ADSK ${yearQuarter(year, quarter)} report`)
      }

      info.push({
        year: year,
        quarter: quarter,
        url: url.startsWith('/') ? 'https://investors.autodesk.com' + url : url
      })
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

async function getReportModifiedOnADSK (yearQuarter: string, url: string): Promise<Date> {
  return url.startsWith('https://investors.autodesk.com/static-files/')
    ? await getReportModifiedOn(yearQuarter, url)
    : await getReportModifiedOnEmpty(yearQuarter, url)
}

export default downloadReportsMiddleware('ADSK', downloadReportsInfo, getReportModifiedOnADSK, downloadReportsData)
