/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  Sequelize
} from 'sequelize'

class DeliveryModel extends Model<
InferAttributes<DeliveryModel>,
InferCreationAttributes<DeliveryModel>
> {
  declare id: CreationOptional<number>
  declare name: string
  declare price: number
  declare deluxePrice: number
  declare eta: number
  declare icon: string
}

const DeliveryModelInit = (sequelize: Sequelize) => {
  DeliveryModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      price: DataTypes.FLOAT,
      deluxePrice: DataTypes.FLOAT,
      eta: DataTypes.FLOAT,
      icon: DataTypes.STRING
    },
    {
      tableName: 'Deliveries',
      sequelize
    }
  )
}

export { DeliveryModel, DeliveryModelInit }
