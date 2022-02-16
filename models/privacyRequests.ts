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

class PrivacyRequestModel extends Model<
  InferAttributes<PrivacyRequestModel>,
  InferCreationAttributes<PrivacyRequestModel>
> {
  declare id: CreationOptional<number>;
  declare UserId: number;
  declare deletionRequested: boolean;
}

PrivacyRequestModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    UserId: {
      type: DataTypes.INTEGER,
    },
    deletionRequested: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "PrivacyRequest",
    sequelize,
  }
);

PrivacyRequestModel.belongsTo(UserModel, {
  constraints: true,
  foreignKeyConstraint: true,
});

export default PrivacyRequestModel;

// export = (sequelize, { INTEGER, BOOLEAN }) => {
//     const PrivacyRequest = sequelize.define("PrivacyRequest", {
//         UserId: { type: INTEGER },
//         deletionRequested: { type: BOOLEAN, defaultValue: false },
//     });

//     PrivacyRequest.associate = ({ User }) => {
//         PrivacyRequest.belongsTo(User, {
//             constraints: true,
//             foreignKeyConstraint: true,
//         });
//     };

//     return PrivacyRequest;
// };
