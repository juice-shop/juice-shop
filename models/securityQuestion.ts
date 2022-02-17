/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
const security = require("../lib/insecurity");
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class SecurityQuestionModel extends Model<
  InferAttributes<SecurityQuestionModel>,
  InferCreationAttributes<SecurityQuestionModel>
> {
  declare id: CreationOptional<number>;
  declare question: string;
}

SecurityQuestionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "SecurityQuestion",
    sequelize,
  }
);

export default SecurityQuestionModel;
