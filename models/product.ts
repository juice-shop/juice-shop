/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import utils = require('../lib/utils')
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  Sequelize
} from 'sequelize'
import { BasketItemModel } from './basketitem'
const security = require('../lib/insecurity')
const challenges = require('../data/datacache').challenges

class ProductModel extends Model<
InferAttributes<ProductModel>,
InferCreationAttributes<ProductModel>
> {
  declare id: CreationOptional<number>
  declare name: string
  declare description: string
  declare price: number
  declare deluxePrice: number
  declare image: string
  declare BasketItemModel?: CreationOptional<BasketItemModel> // Note this is optional since it's only populated when explicitly requested in code
}

const ProductModelInit = (sequelize: Sequelize) => {
  ProductModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      description: {
        type: DataTypes.STRING,
        set (description: string) {
          if (!utils.disableOnContainerEnv()) {
            utils.solveIf(challenges.restfulXssChallenge, () => {
              return utils.contains(
                description,
                '<iframe src="javascript:alert(`xss`)">'
              )
            })
          } else {
            description = security.sanitizeSecure(description)
          }
          this.setDataValue('description', description)
        }
      },
      price: DataTypes.DECIMAL,
      deluxePrice: DataTypes.DECIMAL,
      image: DataTypes.STRING
    },
    {
      tableName: 'Products',
      sequelize,
      paranoid: true
    }
  )
}

export { ProductModel, ProductModelInit }
