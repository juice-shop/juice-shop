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
import ProductModel from "./product";

class QuantityModel extends Model<
  InferAttributes<QuantityModel>,
  InferCreationAttributes<QuantityModel>
> {
  declare ProductId: number;
  declare id: CreationOptional<number>;
  declare quantity: number;
  declare limitPerUser: number | null;
}

QuantityModel.init(
  // @ts-expect-error
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true,
      },
    },
    limitPerUser: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true,
      },
      defaultValue: null,
    },
  },
  {
    tableName: "Quantity",
    sequelize,
  }
);

QuantityModel.belongsTo(ProductModel, {
  constraints: true,
  foreignKeyConstraint: true,
});

export default QuantityModel;
