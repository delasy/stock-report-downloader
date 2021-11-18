import axios from 'axios'
import cheerio from 'cheerio'

import type { DownloadReportsInfo, DownloadReportsData } from '../middlewares/download-reports'
import { downloadReportsMiddleware } from '../middlewares/download-reports'
import { getUserAgent, yearQuarter } from '../utils'

async function downloadReportsInfo (): Promise<DownloadReportsInfo[]> {
  const res = await axios.get('https://investors.zoom.us/financial-information/quarterly-results', {
    headers: {
      'user-agent': getUserAgent()
    }
  })

  const $ = cheerio.load(res.data)
  const info: DownloadReportsInfo[] = []

  $('.fyTabsYear a').each((_, yearEl) => {
    const $year = $(yearEl)
    const yearText = $year.text().trim().slice(3)
    const year = parseInt(yearText)

    if (isNaN(year)) {
      throw new Error(`Incomplete ZM report (year: ${yearText})`)
    }

    $($year.attr('href')).find('.bundleContent').each((_, quarterEl) => {
      const $quarter = $(quarterEl)
      const quarterText = $quarter.find('h4').first().text().trim().slice(1)
      const quarter = parseInt(quarterText)

      if (isNaN(quarter)) {
        throw new Error(`Incomplete ZM ${yearText} report (quarter: ${quarterText})`)
      }

      const url = $quarter.find('.fy-content a').eq(1).attr('href')

      if (typeof url === 'undefined' || url === '') {
        throw new Error(`Incomplete ZM ${yearQuarter(year, quarter)} report`)
      }

      info.push({
        year: year,
        quarter: quarter,
        url: 'https://investors.zoom.us' + url
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

async function getReportModifiedOn (_: string, url: string): Promise<Date> {
  const res = await axios.get(url, {
    headers: {
      'user-agent': getUserAgent()
    }
  })

  const $ = cheerio.load(res.data)
  const dateText = $('.field--name-field-nir-news-date').eq(0).text().trim().replace(' at ', ' ')
  const date = new Date(dateText)

  if (isNaN(date.getTime())) {
    throw new Error(`Last modified not present when requesting ${url}`)
  }

  return date
}

export default downloadReportsMiddleware('ZM', downloadReportsInfo, getReportModifiedOn, downloadReportsData)
