/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as utils from '../lib/utils'
import * as challengeUtils from '../lib/challengeUtils'
import {
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  DataTypes,
  type CreationOptional,
  type Sequelize
} from 'sequelize'
import { type BasketItemModel } from './basketitem'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'

export type AlternateImage = {
  file: string
  format: string
} & (
  | { density: string, width?: never }
  | { width: string, density?: never }
)

class Product extends Model<
InferAttributes<Product>,
InferCreationAttributes<Product>
> {
  declare id: CreationOptional<number>
  declare name: string
  declare description: string
  declare price: number
  declare deluxePrice: number
  declare image: string
  declare alternateImages: CreationOptional<AlternateImage[] | null>
  declare BasketItem?: CreationOptional<BasketItemModel> // Note this is optional since it's only populated when explicitly requested in code
}

const ProductModelInit = (sequelize: Sequelize) => {
  Product.init(
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
          if (utils.isChallengeEnabled(challenges.restfulXssChallenge)) {
            challengeUtils.solveIf(challenges.restfulXssChallenge, () => {
              return description?.includes('<iframe src="javascript:alert(`xss`)">') ?? false
            })
          } else {
            description = security.sanitizeSecure(description)
          }
          this.setDataValue('description', description)
        }
      },
      price: DataTypes.DECIMAL,
      deluxePrice: DataTypes.DECIMAL,
      image: DataTypes.STRING,
      alternateImages: DataTypes.JSON
    },
    {
      tableName: 'Products',
      sequelize,
      paranoid: true
    }
  )
}

export { Product as ProductModel, ProductModelInit }
