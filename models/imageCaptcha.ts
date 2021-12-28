/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export = (sequelize, { INTEGER, STRING }) => {
  const ImageCaptcha = sequelize.define('ImageCaptcha', {
    image: STRING,
    answer: STRING,
    UserId: { type: INTEGER }
  })

  ImageCaptcha.associate = ({ User }) => {
    ImageCaptcha.belongsTo(User)
  }

  return ImageCaptcha
}
