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
  CreationOptional,
  NonAttribute
} from 'sequelize'
import { sequelize } from './index'
import BasketItemModel from './basketitem'
import UserModel from './user'
import ProductModel from './product'

class BasketModel extends Model<
InferAttributes<BasketModel>,
InferCreationAttributes<BasketModel>
> {
  declare UserId: number
  declare id: CreationOptional<number>
  declare coupon: CreationOptional<string> | null
  declare Products?: NonAttribute<ProductModel[]>
}

BasketModel.init(
  // @ts-expect-error
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    coupon: DataTypes.STRING
  },
  {
    tableName: 'Basket',
    sequelize
  }
)

BasketModel.belongsTo(UserModel, {
  constraints: true,
  foreignKeyConstraint: true
})
BasketModel.belongsToMany(ProductModel, {
  through: BasketItemModel,
  foreignKey: {
    name: 'BasketId'
    // TODO noUpdate: true
  }
})

export default BasketModel
