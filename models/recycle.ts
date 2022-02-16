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
import AddressModel from "./address";
import { sequelize } from "./index";
import UserModel from "./user";

class RecycleModel extends Model<
  InferAttributes<RecycleModel>,
  InferCreationAttributes<RecycleModel>
> {
  declare id: CreationOptional<number>;
  declare quantity: number;
  declare isPickup: boolean;
  declare date: string;
}

RecycleModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // TODO set this as DataTypes.INTEGER(4)
    quantity: DataTypes.INTEGER,
    isPickup: { type: DataTypes.BOOLEAN, defaultValue: false },
    date: DataTypes.DATE,
  },
  {
    tableName: "Recycle",
    sequelize,
  }
);

RecycleModel.belongsTo(UserModel, {
  constraints: true,
  foreignKeyConstraint: true,
});
RecycleModel.belongsTo(AddressModel, {
  constraints: true,
  foreignKeyConstraint: true,
});

export default RecycleModel;

// export = (sequelize, { INTEGER, BOOLEAN, DATE }) => {
//     const Recycle = sequelize.define("Recycle", {
//         quantity: INTEGER(4),
//         isPickup: { type: BOOLEAN, defaultValue: false },
//         date: DATE,
//     });

//     Recycle.associate = ({ User, Address }) => {
//         Recycle.belongsTo(User, {
//             constraints: true,
//             foreignKeyConstraint: true,
//         });
//         Recycle.belongsTo(Address, {
//             constraints: true,
//             foreignKeyConstraint: true,
//         });
//     };

//     return Recycle;
// };
