require('dotenv').config()

function validateEnvVar (name) {
  if (typeof process.env[name] === 'undefined') {
    throw new Error(`Environment variable ${name} is not set`)
  }
}

validateEnvVar('AMQP_URL')
validateEnvVar('DATABASE_URL')
validateEnvVar('TELEGRAM_BOT_TOKEN')
