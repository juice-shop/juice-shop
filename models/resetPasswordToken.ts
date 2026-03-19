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

class ResetPasswordToken extends Model<
InferAttributes<ResetPasswordToken>,
InferCreationAttributes<ResetPasswordToken>
> {
  declare UserId: number
  declare id: CreationOptional<number>
  declare token: string
  declare expiresAt: Date
}

const ResetPasswordTokenModelInit = (sequelize: Sequelize) => {
  ResetPasswordToken.init(
    {
      UserId: {
        type: DataTypes.INTEGER
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      token: {
        type: DataTypes.STRING,
        unique: true
      },
      expiresAt: DataTypes.DATE
    },
    {
      tableName: 'ResetPasswordTokens',
      sequelize
    }
  )
}

export { ResetPasswordToken as ResetPasswordTokenModel, ResetPasswordTokenModelInit }
