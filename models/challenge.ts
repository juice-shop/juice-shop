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
class ChallengeModel extends Model<
InferAttributes<ChallengeModel>,
InferCreationAttributes<ChallengeModel>
> {
  declare id: CreationOptional<number>
  declare name: string
  declare category: string
  declare description: string
  declare difficulty: number
  declare hint: string | null
  declare hintUrl: string | null
  declare mitigationUrl: CreationOptional<string> | null
  declare key: string
  declare disabledEnv: CreationOptional<string>
  declare tutorialOrder: CreationOptional<number> | null
  declare tags: string | undefined
  declare solved: CreationOptional<boolean>
  declare codingChallengeStatus: CreationOptional<number>
}

const ChallengeModelInit = (sequelize: Sequelize) => {
  ChallengeModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      key: DataTypes.STRING,
      name: DataTypes.STRING,
      category: DataTypes.STRING,
      tags: DataTypes.STRING,
      description: DataTypes.STRING,
      difficulty: DataTypes.INTEGER,
      hint: DataTypes.STRING,
      hintUrl: DataTypes.STRING,
      mitigationUrl: DataTypes.STRING,
      solved: DataTypes.BOOLEAN,
      disabledEnv: DataTypes.STRING,
      tutorialOrder: DataTypes.NUMBER,
      codingChallengeStatus: DataTypes.NUMBER
    },
    {
      tableName: 'Challenges',
      sequelize
    }
  )
}

export { ChallengeModel, ChallengeModelInit }
