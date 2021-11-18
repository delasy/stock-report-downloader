import type { Optional } from 'sequelize'
import { DataTypes, Model } from 'sequelize'

import type { TelegramSendOptions } from '../telegram'
import sequelize from '../config/sequelize'
import telegram from '../telegram'

interface UserAttributes {
  readonly id: string
  telegramId: number
  active: boolean
  username: string
  firstName: string
  lastName: string
  lang: string
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'active'> {
}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public readonly id!: string
  public telegramId!: number
  public active!: boolean
  public username!: string
  public firstName!: string
  public lastName!: string
  public lang!: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  public static async telegramBroadcast (message: string, options?: TelegramSendOptions): Promise<void> {
    const users = await User.findAll({
      where: {
        active: true
      }
    })

    for (const user of users) {
      try {
        await telegram.send(user.telegramId, message, options)
      } catch {
        await user.update({
          active: false
        })
      }
    }
  }
}

User.init({
  id: {
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    type: DataTypes.UUID
  },
  telegramId: {
    allowNull: false,
    type: DataTypes.BIGINT,
    unique: true
  },
  active: {
    allowNull: false,
    defaultValue: true,
    type: DataTypes.BOOLEAN
  },
  username: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true
  },
  firstName: {
    allowNull: false,
    type: DataTypes.STRING
  },
  lastName: {
    allowNull: false,
    type: DataTypes.STRING
  },
  lang: {
    allowNull: false,
    type: DataTypes.STRING(2)
  }
}, {
  modelName: 'user',
  sequelize: sequelize
})

export default User
