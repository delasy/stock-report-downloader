import type { Schema } from 'express-validator'
import { Router } from 'express'
import { checkSchema, validationResult } from 'express-validator'

import { Report, User } from '../models'
import { wrapMiddleware } from '../middlewares/wrap'

const router = Router()

const validateGetReport: Schema = {
  id: {
    in: 'params',
    errorMessage: 'Invalid report id',
    exists: {
      bail: true
    },
    isUUID: {
      bail: true,
      options: 4
    },
    custom: {
      options: async (val, { req }) => {
        req.locals.report = await Report.findByPk(val)

        if (req.locals.report === null) {
          throw new Error('Invalid report id')
        }

        return true
      }
    }
  }
}

const validatePostReport: Schema = {
  ...validateGetReport,
  revenue: {
    in: 'body',
    errorMessage: 'Invalid revenue',
    exists: {
      errorMessage: 'Revenue not set',
      bail: true
    },
    isInt: {
      bail: true
    },
    toInt: true
  },
  grossProfit: {
    in: 'body',
    errorMessage: 'Invalid gross profit',
    exists: {
      errorMessage: 'Gross profit not set',
      bail: true
    },
    isInt: {
      bail: true
    },
    toInt: true
  },
  operatingProfit: {
    in: 'body',
    errorMessage: 'Invalid operating profit',
    exists: {
      errorMessage: 'Operating profit not set',
      bail: true
    },
    isInt: {
      bail: true
    },
    toInt: true
  },
  netIncome: {
    in: 'body',
    errorMessage: 'Invalid net income',
    exists: {
      errorMessage: 'Net income not set',
      bail: true
    },
    isInt: {
      bail: true
    },
    toInt: true
  }
}

router.use(wrapMiddleware((req, res, next): void => {
  req.locals = {}
  res.locals = {}
  next()
}))

router.get('/report/:id', checkSchema(validateGetReport), wrapMiddleware(async (req, res, next): Promise<void> => {
  const errors = validationResult(req)
  const report = req.locals.report as Report

  if (!errors.isEmpty()) {
    return next()
  }

  const company = await report.getCompany()

  res.render('report', {
    report: report.toJSON(),
    company: company.toJSON()
  })
}))

router.post('/report/:id', checkSchema(validatePostReport), wrapMiddleware(async (req, res): Promise<void> => {
  const errors = validationResult(req)
  const report = req.locals.report as Report
  const company = await report.getCompany()

  if (!errors.isEmpty()) {
    res.render('report', {
      error: errors.array()[0],
      report: {
        ...report.toJSON(),
        ...req.body
      },
      company: company.toJSON()
    })

    return
  }

  await report.update({
    revenue: req.body.revenue,
    grossProfit: req.body.grossProfit,
    operatingProfit: req.body.operatingProfit,
    netIncome: req.body.netIncome
  })

  const oldReports = await company.getReports()
  let previousReport: Report | null = null

  for (const oldReport of oldReports) {
    if (report.quarter === 1) {
      if (oldReport.year === report.year - 1 && oldReport.quarter === 4) {
        previousReport = oldReport
      }
    } else if (oldReport.year === report.year && oldReport.quarter === report.quarter - 1) {
      previousReport = oldReport
    }
  }

  let message = `${company.name} report fulfilled\n`

  if (previousReport !== null) {
    const revenueDiff = (report.revenue * 100 / previousReport.revenue) - 100
    const netIncomeDiff = (report.netIncome * 100 / previousReport.netIncome) - 100

    message += `Revenue: ${revenueDiff > 0 ? '+' : ''}${revenueDiff.toFixed(2)}%\n`
    message += `Net Income: ${netIncomeDiff > 0 ? '+' : ''}${netIncomeDiff.toFixed(2)}%\n`
  }

  await User.telegramBroadcast(message)
  res.redirect('/reports')
}))

router.all('*', wrapMiddleware((_, res): void => {
  res.status(404).render('errors/404')
}))

export default router
