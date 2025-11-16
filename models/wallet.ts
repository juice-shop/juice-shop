/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import {
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  DataTypes,
  type CreationOptional,
  type Sequelize
} from 'sequelize'

class Wallet extends Model<
InferAttributes<Wallet>,
InferCreationAttributes<Wallet>
> {
  declare UserId: number
  declare id: CreationOptional<number>
  declare balance: CreationOptional<number>
}

const WalletModelInit = (sequelize: Sequelize) => {
  Wallet.init(
    {
      UserId: {
        type: DataTypes.INTEGER
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      balance: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: true
        },
        defaultValue: 0
      }
    },
    {
      tableName: 'Wallets',
      sequelize
    }
  )
}

export { Wallet as WalletModel, WalletModelInit }
