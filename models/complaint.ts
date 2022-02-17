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

class ComplaintModel extends Model<
InferAttributes<ComplaintModel>,
InferCreationAttributes<ComplaintModel>
> {
  declare UserId: number
  declare id: CreationOptional<number>
  declare message: string
  declare file: CreationOptional<string>
}

ComplaintModel.init(
  // @ts-expect-error
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    message: DataTypes.STRING,
    file: DataTypes.STRING
  },
  {
    tableName: 'Complaint',
    sequelize
  }
)

ComplaintModel.belongsTo(UserModel, {
  constraints: true,
  foreignKeyConstraint: true
})

export default ComplaintModel
