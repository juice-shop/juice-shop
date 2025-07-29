/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
  DataTypes,
  type Sequelize
} from 'sequelize'
/* jslint node: true */
class Hint extends Model<
InferAttributes<Hint>,
InferCreationAttributes<Hint>
> {
  declare ChallengeId: number
  declare id: CreationOptional<number>
  declare text: string
  declare order: number
  declare unlocked: boolean
}

const HintModelInit = (sequelize: Sequelize) => {
  Hint.init(
    {
      ChallengeId: {
        type: DataTypes.INTEGER
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      text: {
        type: DataTypes.STRING
      },
      order: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: true,
          min: 1
        }
      },
      unlocked: DataTypes.BOOLEAN
    },
    {
      tableName: 'Hints',
      sequelize
    }
  )
}

export { Hint as HintModel, HintModelInit }
