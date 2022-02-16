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
  NonAttribute,
} from "sequelize";
import { sequelize } from "./index";

class BasketItemModel extends Model<
  InferAttributes<BasketItemModel>,
  InferCreationAttributes<BasketItemModel>
> {
  declare ProductId: number;
  declare id: CreationOptional<number>;
  declare quantity: number;
}

BasketItemModel.init(
  //@ts-expect-error
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quantity: DataTypes.INTEGER,
  },
  {
    tableName: "BasketItem",
    sequelize,
  }
);

export default BasketItemModel;

// export = (sequelize, { INTEGER }) => {
//     const BasketItem = sequelize.define("BasketItem", {
//         id: {
//             type: INTEGER,
//             primaryKey: true,
//             autoIncrement: true,
//             allowNull: false,
//         },
//         quantity: INTEGER,
//     });
//     return BasketItem;
// };
