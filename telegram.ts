import { EventEmitter } from 'events'
import axios from 'axios'

interface TelegramChat {
  id: number
  type: 'channel' | 'group' | 'private' | 'supergroup'
  username: string
  firstName: string
  lastName: string
}

interface TelegramMessage {
  messageId: number
  from: TelegramUser
  chat: TelegramChat
  date: number
  text: string
}

export interface TelegramSendOptions {
  disableWebPagePreview?: boolean
}

interface TelegramUser {
  id: number
  isBot: boolean
  firstName: string
  lastName: string
  username: string
  languageCode: string
}

type TelegramOnError = (event: 'error', listener: (message: Error) => Promise<void> | void) => void
type TelegramOnMessage = (event: 'message', listener: (message: TelegramMessage) => Promise<void> | void) => void

interface TelegramEventEmitter {
  init: () => Promise<void>
  on: TelegramOnError & TelegramOnMessage
  send: (chatId: number, text: string, options?: TelegramSendOptions) => Promise<void>
  startPolling: () => void
  stopPolling: () => void
}

class Telegram extends EventEmitter implements TelegramEventEmitter {
  private readonly _botToken: string
  private _polling: boolean = false
  private _lastUpdateId: number = 0

  static transformMessage (message: any): TelegramMessage {
    return {
      messageId: message.message_id,
      from: {
        id: message.from.id,
        isBot: message.from.is_bot,
        firstName: message.from.first_name,
        lastName: message.from.last_name,
        username: message.from.username,
        languageCode: message.from.language_code
      },
      chat: {
        id: message.chat.id,
        type: message.chat.type,
        username: message.chat.username,
        firstName: message.chat.first_name,
        lastName: message.chat.last_name
      },
      date: message.date,
      text: message.text
    }
  }

  constructor (botToken: string) {
    super()
    this._botToken = botToken
  }

  public async init (): Promise<void> {
    const response = await axios.get(`https://api.telegram.org/bot${this._botToken}/getUpdates`)
    const goodResponse: boolean = response.data.ok

    if (!goodResponse) {
      throw new Error(response.data.description)
    }

    for (const it of response.data.result as any[]) {
      if (it.update_id > this._lastUpdateId) {
        this._lastUpdateId = it.update_id
      }
    }
  }

  public async send (chatId: number, text: string, options?: TelegramSendOptions): Promise<void> {
    const res = await axios.get(`https://api.telegram.org/bot${this._botToken}/sendMessage`, {
      params: {
        chat_id: chatId,
        text: text,
        disable_web_page_preview: options?.disableWebPagePreview ?? false
      }
    })

    const goodRes: boolean = res.data.ok

    if (!goodRes) {
      throw new Error(res.data.description)
    }
  }

  public startPolling (): void {
    this._polling = true

    this._poll().catch((err) => {
      this.emit('error', err)
    })
  }

  public stopPolling (): void {
    // TODO Stop request sent to telegram.org
    this._polling = false
  }

  private async _poll (): Promise<void> {
    if (!this._polling) {
      return
    }

    const res = await axios.get(`https://api.telegram.org/bot${this._botToken}/getUpdates`, {
      params: {
        offset: (this._lastUpdateId + 1).toString(),
        timeout: '5'
      }
    })

    const goodRes: boolean = res.data.ok

    if (!goodRes) {
      throw new Error(res.data.description)
    }

    for (const it of res.data.result as any[]) {
      if (it.update_id > this._lastUpdateId) {
        this._lastUpdateId = it.update_id
        const message = it?.message ?? null

        if (message !== null) {
          this.emit('message', Telegram.transformMessage(it.message))
        }
      }
    }

    await this._poll()
  }
}

const telegram = new Telegram(process.env.TELEGRAM_BOT_TOKEN as string) as TelegramEventEmitter
export default telegram
