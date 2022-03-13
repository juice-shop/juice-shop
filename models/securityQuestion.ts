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

class SecurityQuestionModel extends Model<
InferAttributes<SecurityQuestionModel>,
InferCreationAttributes<SecurityQuestionModel>
> {
  declare id: CreationOptional<number>
  declare question: string
}

const SecurityQuestionModelInit = (sequelize: Sequelize) => {
  SecurityQuestionModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      question: {
        type: DataTypes.STRING
      }
    },
    {
      tableName: 'SecurityQuestions',
      sequelize
    }
  )
}

export { SecurityQuestionModel, SecurityQuestionModelInit }
