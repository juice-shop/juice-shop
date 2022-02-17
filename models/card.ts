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
} from "sequelize";
import { sequelize } from "./index";
import UserModel from "./user";

class CardModel extends Model<
  InferAttributes<CardModel>,
  InferCreationAttributes<CardModel>
> {
  declare UserId: number;
  declare id: CreationOptional<number>;
  declare fullName: string;
  declare cardNum: number;
  declare expMonth: number;
  declare expYear: number;
}

CardModel.init(
  //@ts-expect-error
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: DataTypes.STRING,
    cardNum: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true,
        min: 1000000000000000,
        max: 9999999999999998,
      },
    },
    expMonth: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true,
        min: 1,
        max: 12,
      },
    },
    expYear: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true,
        min: 2080,
        max: 2099,
      },
    },
  },
  {
    tableName: "Card",
    sequelize,
  }
);
CardModel.belongsTo(UserModel, {
  constraints: true,
  foreignKeyConstraint: true,
});

export default CardModel;
