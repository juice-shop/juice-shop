/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export = (sequelize, { INTEGER, STRING }) => {
  const Captcha = sequelize.define('Captcha', {
    captchaId: INTEGER,
    captcha: STRING,
    answer: STRING
  })
  return Captcha
}
