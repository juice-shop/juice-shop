/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
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

class Recycle extends Model<
InferAttributes<Recycle>,
InferCreationAttributes<Recycle>
> {
  declare id: CreationOptional<number>
  declare UserId: number
  declare AddressId: number
  declare quantity: number
  declare isPickup: boolean
  declare date: string
}

const RecycleModelInit = (sequelize: Sequelize) => {
  Recycle.init(
    {
      UserId: {
        type: DataTypes.INTEGER
      },
      AddressId: {
        type: DataTypes.INTEGER
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      quantity: DataTypes.INTEGER,
      isPickup: { type: DataTypes.BOOLEAN, defaultValue: false },
      date: DataTypes.DATE
    },
    {
      tableName: 'Recycles',
      sequelize
    }
  )
}

export { Recycle as RecycleModel, RecycleModelInit }
