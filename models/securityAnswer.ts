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
  NonAttribute,
} from "sequelize";
import { sequelize } from "./index";
import SecurityQuestionModel from "./securityQuestion";
import UserModel from "./user";

class SecurityAnswerModel extends Model<
  InferAttributes<SecurityAnswerModel>,
  InferCreationAttributes<SecurityAnswerModel>
> {
  declare SecurityQuestionId: number;
  declare UserId: number;
  declare id: CreationOptional<number>;
  declare answer: string;
}

SecurityAnswerModel.init(
  // @ts-expect-error
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    answer: {
      type: DataTypes.STRING,
      set(answer) {
        this.setDataValue("answer", security.hmac(answer));
      },
    },
  },
  {
    tableName: "SecurityAnswer",
    sequelize,
  }
);

SecurityAnswerModel.belongsTo(UserModel);
SecurityAnswerModel.belongsTo(SecurityQuestionModel, {
  constraints: true,
  foreignKeyConstraint: true,
});

export default SecurityAnswerModel;

// export = (sequelize, { STRING, INTEGER }) => {
//     const SecurityAnswer = sequelize.define("SecurityAnswer", {
//         answer: {
//             type: STRING,
//             set(answer) {
//                 this.setDataValue("answer", security.hmac(answer));
//             },
//         },
//         UserId: { type: INTEGER, unique: true },
//     });

//     SecurityAnswer.associate = ({ User, SecurityQuestion }) => {
//         SecurityAnswer.belongsTo(User);
//         SecurityAnswer.belongsTo(SecurityQuestion, {
//             constraints: true,
//             foreignKeyConstraint: true,
//         });
//     };

//     return SecurityAnswer;
// };
