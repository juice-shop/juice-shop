/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
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

class Memory extends Model<
InferAttributes<Memory>,
InferCreationAttributes<Memory>
> {
  declare UserId: number
  declare id: CreationOptional<number>
  declare caption: string
  declare imagePath: string
}

const MemoryModelInit = (sequelize: Sequelize) => {
  Memory.init(
    {
      UserId: {
        type: DataTypes.INTEGER
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      caption: {
        type: DataTypes.STRING,
        validate: {
          // Allow letters, numbers, spaces, common punctuation. Adjust as needed.
          is: /^[\w\s.,:;!?'"\-\(\)\[\]]*$/i
        }
      },
      imagePath: {
        type: DataTypes.STRING,
        validate: {
          // Allow only safe path-like structures (alphanumeric, dash, underscore, dot, slash)
          is: /^[\w\-\/\.]+$/i
        }
      }
    },
    {
      tableName: 'Memories',
      sequelize
    }
  )
}

export { Memory as MemoryModel, MemoryModelInit }
