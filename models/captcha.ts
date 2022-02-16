/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class CaptchaModel extends Model<
  InferAttributes<CaptchaModel>,
  InferCreationAttributes<CaptchaModel>
> {
  declare captchaId: number;
  declare captcha: string;
  declare answer: string;
}

CaptchaModel.init(
  {
    captchaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    captcha: DataTypes.STRING,
    answer: DataTypes.STRING,
  },
  {
    tableName: "Captcha",
    sequelize,
  }
);

export default CaptchaModel;

// export = (sequelize, { INTEGER, STRING }) => {
//     const Captcha = sequelize.define("Captcha", {
//         captchaId: INTEGER,
//         captcha: STRING,
//         answer: STRING,
//     });
//     return Captcha;
// };
