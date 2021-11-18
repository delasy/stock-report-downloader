import type { Channel, Connection, ConsumeMessage, Message, Options } from 'amqplib'
import { connect } from 'amqplib'

type AMQPOnMessage = (message: ConsumeMessage | null) => Promise<void> | void

class AMQP {
  private _connected: boolean = false
  private _conn: Connection | null = null
  private _channel: Channel | null = null
  private readonly _url: string

  constructor (url: string) {
    this._url = url
  }

  public ack (message: Message, allUpTo?: boolean): void {
    this._channel?.ack(message, allUpTo)
  }

  public async assertQueue (queue: string, options?: Options.AssertQueue): Promise<void> {
    if (!this._connected) {
      await this._init()
    }

    await this._channel?.assertQueue(queue, options)
  }

  public close (): void {
    if (!this._connected) {
      throw new Error('Tried closing on disconnected amqp')
    }

    void this._channel?.close()
    void this._conn?.close()
    this._connected = false
  }

  public consume (queue: string, onMessage: AMQPOnMessage, options?: Options.Consume): void {
    this._channel?.consume(queue, onMessage as (message: ConsumeMessage | null) => void, options).catch((err) => {
      console.error(err)
    })
  }

  public async deleteQueue (queue: string, options?: Options.DeleteQueue): Promise<void> {
    if (!this._connected) {
      await this._init()
    }

    await this._channel?.deleteQueue(queue, options)
  }

  public async prefetch (count: number, global?: boolean): Promise<void> {
    if (!this._connected) {
      await this._init()
    }

    await this._channel?.prefetch(count, global)
  }

  public sendToQueue (queue: string, content: Buffer | Object | string, options?: Options.Publish): void {
    let message: Buffer

    if (typeof content === 'object' && !Array.isArray(content)) {
      message = Buffer.from(JSON.stringify(content))
    } else if (Buffer.isBuffer(content)) {
      message = content
    } else {
      message = Buffer.from(content)
    }

    this._channel?.sendToQueue(queue, message, options)
  }

  private async _init (): Promise<void> {
    this._conn = await connect(this._url)
    this._channel = await this._conn.createChannel()
    this._connected = true
  }
}

const amqp = new AMQP(process.env.AMQP_URL as string)
export default amqp
