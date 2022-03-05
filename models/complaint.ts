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

class ComplaintModel extends Model<
InferAttributes<ComplaintModel>,
InferCreationAttributes<ComplaintModel>
> {
  declare UserId: number
  declare id: CreationOptional<number>
  declare message: string
  declare file: CreationOptional<string>
}

const ComplaintModelInit=(sequelize:Sequelize)=>{
ComplaintModel.init(
  {
    UserId:{
      type: DataTypes.INTEGER
    },
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    message: DataTypes.STRING,
    file: DataTypes.STRING
  },
  {
    tableName: 'Complaints',
    sequelize
  }
)
}

export {ComplaintModel,ComplaintModelInit}
