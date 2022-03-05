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
const security = require('../lib/insecurity')

class SecurityAnswerModel extends Model<
InferAttributes<SecurityAnswerModel>,
InferCreationAttributes<SecurityAnswerModel>
> {
  declare SecurityQuestionId: number
  declare UserId: number
  declare id: CreationOptional<number>
  declare answer: string
}

const SecurityAnswerModelInit=(sequelize:Sequelize)=>{
SecurityAnswerModel.init(
  {
    UserId:{
      type: DataTypes.INTEGER
    },
    SecurityQuestionId:{
      type: DataTypes.INTEGER
    },
      
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    answer: {
      type: DataTypes.STRING,
      set (answer) {
        this.setDataValue('answer', security.hmac(answer))
      }
    }
  },
  {
    tableName: 'SecurityAnswers',
    sequelize
  }
)
}

export {SecurityAnswerModel,SecurityAnswerModelInit}
