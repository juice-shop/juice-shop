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

class PrivacyRequestModel extends Model<
InferAttributes<PrivacyRequestModel>,
InferCreationAttributes<PrivacyRequestModel>
> {
  declare id: CreationOptional<number>
  declare UserId: number
  declare deletionRequested: boolean
}

PrivacyRequestModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    UserId: {
      type: DataTypes.INTEGER
    },
    deletionRequested: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    tableName: 'PrivacyRequests',
    sequelize
  }
)

export default PrivacyRequestModel
