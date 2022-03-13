/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes,
  Sequelize
} from 'sequelize'
/* jslint node: true */
class AddressModel extends Model<
InferAttributes<AddressModel>,
InferCreationAttributes<AddressModel>
> {
  declare UserId: number
  declare id: CreationOptional<number>
  declare fullName: string
  declare mobileNum: number
  declare zipCode: string
  declare streetAddress: string
  declare city: string
  declare state: string | null
  declare country: string
}

const AddressModelInit = (sequelize: Sequelize) => {
  AddressModel.init(
    {
      UserId: {
        type: DataTypes.INTEGER
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fullName: {
        type: DataTypes.STRING
      },
      mobileNum: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: true,
          min: 1000000,
          max: 9999999999
        }
      },
      zipCode: {
        type: DataTypes.STRING,
        validate: {
          len: [1, 8]
        }
      },
      streetAddress: {
        type: DataTypes.STRING,
        validate: {
          len: [1, 160]
        }
      },
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      country: DataTypes.STRING
    },
    {
      tableName: 'Addresses',
      sequelize
    }
  )
}

export { AddressModel, AddressModelInit }
