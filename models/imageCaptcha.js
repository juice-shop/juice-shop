/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

module.exports = (sequelize, { INTEGER, STRING }) => {
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
