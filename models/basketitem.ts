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
  Sequelize
} from 'sequelize'

class BasketItemModel extends Model<
InferAttributes<BasketItemModel>,
InferCreationAttributes<BasketItemModel>
> {
  declare ProductId: number
  declare BasketId: number
  declare id: CreationOptional<number>
  declare quantity: number
}

const BasketItemModelInit=(sequelize:Sequelize)=>{
BasketItemModel.init(
  {
    ProductId:{
      type: DataTypes.INTEGER
    },
    BasketId:{
      type: DataTypes.INTEGER
    },
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quantity: DataTypes.INTEGER
  },
  {
    tableName: 'BasketItems',
    sequelize
  }
)
}

export {BasketItemModel,BasketItemModelInit}
