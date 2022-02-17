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
import SecurityQuestionModel from './securityQuestion'
import UserModel from './user'
const security = require('../lib/insecurity')

class SecurityAnswerModel extends Model<
InferAttributes<SecurityAnswerModel>,
InferCreationAttributes<SecurityAnswerModel>
> {
  declare SecurityQuestionId: number
  declare UserId: number
  declare id: CreationOptional<number>
  declare answer: string
}

SecurityAnswerModel.init(
  // @ts-expect-error
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    answer: {
      type: DataTypes.STRING,
      set (answer) {
        this.setDataValue('answer', security.hmac(answer))
      }
    }
  },
  {
    tableName: 'SecurityAnswer',
    sequelize
  }
)

SecurityAnswerModel.belongsTo(UserModel)
SecurityAnswerModel.belongsTo(SecurityQuestionModel, {
  constraints: true,
  foreignKeyConstraint: true
})

export default SecurityAnswerModel
