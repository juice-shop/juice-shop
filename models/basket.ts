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
  NonAttribute,
  Sequelize
} from 'sequelize'
import {ProductModel} from './product'

class BasketModel extends Model<
InferAttributes<BasketModel>,
InferCreationAttributes<BasketModel>
> {
  declare UserModelId: CreationOptional<number>
  declare id: CreationOptional<number>
  declare coupon: CreationOptional<string> | null
  declare ProductModels?: NonAttribute<ProductModel[]>
}

const BasketModelInit=(sequelize:Sequelize)=>{
BasketModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    coupon: DataTypes.STRING,
    UserModelId:{
      type: DataTypes.INTEGER
    }
  },
  {
    tableName: 'Baskets',
    sequelize
  }
)
}

export {BasketModel,BasketModelInit}
