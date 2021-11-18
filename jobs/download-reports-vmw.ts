import axios from 'axios'
import cheerio from 'cheerio'

import type { DownloadReportsInfo, DownloadReportsData } from '../middlewares/download-reports'
import { downloadReportsMiddleware, getReportModifiedOnEmpty } from '../middlewares/download-reports'
import { getUserAgent, yearQuarter } from '../utils'

async function downloadReportsInfo (): Promise<DownloadReportsInfo[]> {
  const res = await axios.get('https://ir.vmware.com/websites/vmware/English/4100/financial-document-library.html', {
    headers: {
      'user-agent': getUserAgent()
    }
  })

  const $ = cheerio.load(res.data)
  const info: DownloadReportsInfo[] = []

  $('.documents__contents__years').each((_, yearEl) => {
    const $year = $(yearEl)
    const yearText = $year.find('.documents__head').text().trim().slice(2)
    const year = parseInt(yearText)

    if (isNaN(year)) {
      throw new Error(`Incomplete VMW report (year: ${yearText})`)
    }

    $year.find('.documents__year').eq(2).find('a.download.file-circle').each((_, quarterEl) => {
      const $quarter = $(quarterEl)
      const quarterText = $quarter.find('.file-text').first().text().trim().slice(1)
      const quarter = parseInt(quarterText)

      if (isNaN(quarter)) {
        throw new Error(`Incomplete VMW ${yearText} report (quarter: ${quarterText})`)
      }

      const url = $quarter.attr('href')

      if (typeof url === 'undefined' || url === '') {
        throw new Error(`Incomplete VMW ${yearQuarter(year, quarter)} report`)
      }

      info.push({
        year: year,
        quarter: quarter,
        url: 'https://ir.vmware.com' + url
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

export default downloadReportsMiddleware('VMW', downloadReportsInfo, getReportModifiedOnEmpty, downloadReportsData)
