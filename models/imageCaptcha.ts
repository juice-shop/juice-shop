/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  DataTypes,
  type CreationOptional,
  type Sequelize
} from 'sequelize'

class ImageCaptcha extends Model<
InferAttributes<ImageCaptcha>,
InferCreationAttributes<ImageCaptcha>
> {
  declare id: CreationOptional<number>
  declare image: string
  declare answer: string
  declare UserId: number
  declare createdAt: CreationOptional<Date>
}

const ImageCaptchaModelInit = (sequelize: Sequelize) => {
  ImageCaptcha.init(
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
      tableName: 'ImageCaptchas',
      sequelize
    }
  )
}

export { ImageCaptcha as ImageCaptchaModel, ImageCaptchaModelInit }
