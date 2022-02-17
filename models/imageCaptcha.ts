/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional
} from 'sequelize'
import { sequelize } from './index'
import UserModel from './user'

class ImageCaptchaModel extends Model<
InferAttributes<ImageCaptchaModel>,
InferCreationAttributes<ImageCaptchaModel>
> {
  declare id: CreationOptional<number>
  declare image: string
  declare answer: string
  declare UserId: number
  declare createdAt: CreationOptional<Date>
}

ImageCaptchaModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    image: DataTypes.STRING,
    answer: DataTypes.STRING,
    UserId: { type: DataTypes.INTEGER },
    createdAt: DataTypes.DATE
  },
  {
    tableName: 'ImageCaptcha',
    sequelize
  }
)

ImageCaptchaModel.belongsTo(UserModel)

export default ImageCaptchaModel
