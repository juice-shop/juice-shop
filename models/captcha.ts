/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Sequelize
} from 'sequelize'

class CaptchaModel extends Model<
InferAttributes<CaptchaModel>,
InferCreationAttributes<CaptchaModel>
> {
  declare captchaId: number
  declare captcha: string
  declare answer: string
}

const CaptchaModelInit=(sequelize:Sequelize)=>{
CaptchaModel.init(
  {
    captchaId: {
      type: DataTypes.INTEGER,
    },
    captcha: DataTypes.STRING,
    answer: DataTypes.STRING
  },
  {
    tableName: 'Captchas',
    sequelize
  }
)
}

export {CaptchaModel,CaptchaModelInit}
