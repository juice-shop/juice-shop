/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
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

class BasketItem extends Model<
InferAttributes<BasketItem>,
InferCreationAttributes<BasketItem>
> {
  declare ProductId: number
  declare BasketId: number
  declare id: CreationOptional<number>
  declare quantity: number
}

const BasketItemModelInit = (sequelize: Sequelize) => {
  BasketItem.init(
    {
      ProductId: {
        type: DataTypes.INTEGER
      },
      BasketId: {
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

export { BasketItem as BasketItemModel, BasketItemModelInit }
