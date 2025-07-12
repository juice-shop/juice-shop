/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  DataTypes,
  type CreationOptional,
  type Sequelize
} from 'sequelize'

class HintUsage extends Model<
InferAttributes<HintUsage>,
InferCreationAttributes<HintUsage>
> {
  declare id: CreationOptional<number>
  declare UserId: number
  declare ChallengeId: number
  declare hintState: number // 1 for hint revealed, 2 for link used
}

const HintUsageModelInit = (sequelize: Sequelize) => {
  HintUsage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      UserId: {
        type: DataTypes.INTEGER
      },
      ChallengeId: {
        type: DataTypes.INTEGER
      },
      hintState: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    },
    {
      tableName: 'HintUsages',
      sequelize
    }
  )
}

export { HintUsage as HintUsageModel, HintUsageModelInit }
