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

class MemoryModel extends Model<
InferAttributes<MemoryModel>,
InferCreationAttributes<MemoryModel>
> {
  declare UserId: number
  declare id: CreationOptional<number>
  declare caption: string
  declare imagePath: string
}

const MemoryModelInit = (sequelize: Sequelize) => {
  MemoryModel.init(
    {
      UserId: {
        type: DataTypes.INTEGER
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      caption: DataTypes.STRING,
      imagePath: DataTypes.STRING
    },
    {
      tableName: 'Memories',
      sequelize
    }
  )
}

export { MemoryModel, MemoryModelInit }
