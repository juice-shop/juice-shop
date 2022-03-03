/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional
} from 'sequelize'
import { sequelize } from './index'
import UserModel from './user'

class WalletModel extends Model<
InferAttributes<WalletModel>,
InferCreationAttributes<WalletModel>
> {
  declare UserId: number
  declare id: CreationOptional<number>
  declare balance: CreationOptional<number>
}

WalletModel.init(
  // @ts-expect-error
  {
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

export default WalletModel
