/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

module.exports = (sequelize, { INTEGER, STRING }) => {
  const Captcha = sequelize.define('Captcha', {
    captchaId: INTEGER,
    captcha: STRING,
    answer: STRING
  })
  return Captcha
}
