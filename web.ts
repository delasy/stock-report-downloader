// TODO Read what you need to look at in report to make decision

import './config/dotenv'

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { create as handlebarsCreate } from 'express-handlebars'

import controllers from './controllers'

const app = express()
const port = process.env.PORT ?? 8080

const hbs = handlebarsCreate({
  extname: 'hbs',
  helpers: {
    ifeq (a: any, b: any, options: any) {
      return a === b ? options.fn(this) : options.inverse(this)
    },
    ifnoteq (a: any, b: any, options: any) {
      return a !== b ? options.fn(this) : options.inverse(this)
    }
  }
})

app.engine('hbs', hbs.engine as any)
app.set('trust proxy', true)
app.set('view engine', 'hbs')

app.use(helmet())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static('public'))
app.use(controllers)

app.listen(port, () => {
  console.info(`Web successfully listening on ${port}`)
})
