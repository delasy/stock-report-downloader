import axios from 'axios'

import type { DownloadReportsInfo, DownloadReportsData } from '../middlewares/download-reports'
import { downloadReportsMiddleware, getReportModifiedOn } from '../middlewares/download-reports'
import { getUserAgent, isLongQuarter, toNumQuarter, yearQuarter } from '../utils'

async function downloadReportsInfo (): Promise<DownloadReportsInfo[]> {
  const res = await axios.get('https://investor.apple.com/feed/FinancialReport.svc/GetFinancialReportList', {
    headers: {
      'user-agent': getUserAgent()
    },
    params: {
      reportTypes: 'First Quarter|Second Quarter|Third Quarter|Fourth Quarter'
    }
  })

  const reportsData: any[] | null = res.data?.GetFinancialReportListResult ?? null

  if (reportsData === null) {
    throw new Error('No data returned by API endpoint in AAPL reports handler')
  }

  const info: DownloadReportsInfo[] = []

  for (const reportData of reportsData) {
    const reportYear: number | null = reportData?.ReportYear ?? null

    if (reportYear === null) {
      throw new Error('Incomplete AAPL report')
    }

    const reportQuarter: string | null = reportData?.ReportSubType ?? null

    if (reportQuarter === null || !isLongQuarter(reportQuarter)) {
      throw new Error(`Incomplete AAPL ${reportYear.toString()} report`)
    }

    const quarter = toNumQuarter(reportQuarter)
    const reportDocuments: any[] | null = reportData?.Documents ?? null
    const reportUrl = reportDocuments?.find(it => it.DocumentCategory === 'statement')?.DocumentPath ?? null

    if (reportUrl === null) {
      throw new Error(`Incomplete AAPL ${yearQuarter(reportYear, quarter)} report`)
    }

    info.push({
      year: reportYear,
      quarter: quarter,
      url: reportUrl
    })
  }

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

export default downloadReportsMiddleware('AAPL', downloadReportsInfo, getReportModifiedOn, downloadReportsData)
