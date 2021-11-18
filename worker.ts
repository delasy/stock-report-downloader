import './config/dotenv'

import { Op } from 'sequelize'

import { Company, User } from './models'
import amqp from './amqp'
import jobs from './jobs'
import telegram from './telegram'

function loopWorker (): void {
  setTimeout(() => {
    Company.findAll()
      .then((companies) => {
        for (const company of companies) {
          amqp.sendToQueue('jobs', {
            name: `downloadReports${company.ticker}`,
            params: []
          })
        }

        loopWorker()
      })
      .catch((err) => {
        console.error(err)
      })
  }, 60000)
}

async function main (): Promise<void> {
  await amqp.deleteQueue('jobs')

  await amqp.assertQueue('jobs', {
    durable: true
  })

  await amqp.prefetch(1)
  await telegram.init()

  const companies = await Company.findAll()

  for (const company of companies) {
    amqp.sendToQueue('jobs', {
      name: `downloadReports${company.ticker}`,
      params: []
    })
  }

  amqp.consume('jobs', async (message) => {
    if (message === null) {
      return
    }

    const payload = JSON.parse(message.content.toString())
    const jobName: string = payload.name
    const jobParams: any[] = payload.params

    try {
      await jobs[jobName].apply(null, jobParams)
    } catch (err) {
      console.error(err)
    }

    amqp.ack(message)
  })

  telegram.on('message', async (message) => {
    if (message.from.id !== message.chat.id) {
      await telegram.send(message.from.id, 'Chat type is not supported')
      return
    }

    if (message.text === '/start') {
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { telegramId: message.from.id },
            { username: message.from.username }
          ]
        }
      })

      if (user === null) {
        await User.create({
          telegramId: message.from.id,
          username: message.from.username,
          firstName: message.from.firstName,
          lastName: message.from.lastName,
          lang: message.from.languageCode
        })
      } else if (!user.active) {
        await user.update({
          active: true
        })
      }
    } else if (message.text.startsWith('/echo ') && message.text.length > 6) {
      await telegram.send(message.from.id, message.text.slice(6))
    }
  })

  telegram.on('error', (err) => {
    console.error(err)
  })

  telegram.startPolling()
  loopWorker()
  console.info('Worker launched successfully')
}

main().catch((err) => {
  console.error(err)
})
