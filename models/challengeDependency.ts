/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
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

class ChallengeDependency extends Model<
InferAttributes<ChallengeDependency>,
InferCreationAttributes<ChallengeDependency>
> {
  declare ChallengeId: number
  declare id: CreationOptional<number>
  declare name: string
  declare documentation: string
  declare key: string
  declare missing: boolean
}

const ChallengeDependencyModelInit = (sequelize: Sequelize) => {
  ChallengeDependency.init(
    {
      ChallengeId: {
        type: DataTypes.INTEGER
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING
      },
      documentation: {
        type: DataTypes.STRING
      },
      key: {
        type: DataTypes.STRING
      },
      missing: {
        type: DataTypes.BOOLEAN
      }
    },
    {
      tableName: 'ChallengeDependencies',
      sequelize
    }
  )
}

export { ChallengeDependency as ChallengeDependencyModel, ChallengeDependencyModelInit }
