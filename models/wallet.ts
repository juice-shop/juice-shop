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
  type Sequelize,
  type ForeignKey
} from 'sequelize'

class Wallet extends Model<
InferAttributes<Wallet>,
InferCreationAttributes<Wallet>
> {
  declare id: CreationOptional<number>
  declare balance: CreationOptional<number>
  declare UserId: ForeignKey<number> // foreign key to associate with User model
}

const WalletModelInit = (sequelize: Sequelize) => {
  Wallet.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      balance: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          isInt: true
        }
      },
      UserId: {
        type: DataTypes.INTEGER
      }
    },
    {
      tableName: 'Wallets',
      sequelize
    }
  )
}

export { Wallet as WalletModel, WalletModelInit }
