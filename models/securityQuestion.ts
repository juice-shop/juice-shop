/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
export = (sequelize, { STRING }) => {
  const SecurityQuestion = sequelize.define('SecurityQuestion', {
    question: STRING
  }
  )
  return SecurityQuestion
}
