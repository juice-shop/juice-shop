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
import AddressModel from './address'
import { sequelize } from './index'
import UserModel from './user'

class RecycleModel extends Model<
InferAttributes<RecycleModel>,
InferCreationAttributes<RecycleModel>
> {
  declare id: CreationOptional<number>
  declare UserId: number
  declare AddressId: number
  declare quantity: number
  declare isPickup: boolean
  declare date: string
}

RecycleModel.init(
  {
    UserId:{
      type: DataTypes.INTEGER
    },
    AddressId:{
      type: DataTypes.INTEGER
    },    
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // TODO set this as DataTypes.INTEGER(4)
    quantity: DataTypes.INTEGER,
    isPickup: { type: DataTypes.BOOLEAN, defaultValue: false },
    date: DataTypes.DATE
  },
  {
    tableName: 'Recycles',
    sequelize
  }
)

export default RecycleModel
