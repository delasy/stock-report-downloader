import downloadReportsAAPL from './download-reports-aapl'
import downloadReportsADSK from './download-reports-adsk'
import downloadReportsDELL from './download-reports-dell'
import downloadReportsHPQ from './download-reports-hpq'
import downloadReportsVMW from './download-reports-vmw'
import downloadReportsZM from './download-reports-zm'

const jobs: Record<string, any> = {
  downloadReportsAAPL,
  downloadReportsADSK,
  downloadReportsDELL,
  downloadReportsHPQ,
  downloadReportsVMW,
  downloadReportsZM
}

export default jobs
