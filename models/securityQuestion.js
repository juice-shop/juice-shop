/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
module.exports = (sequelize, { STRING }) => {
  const SecurityQuestion = sequelize.define('SecurityQuestion', {
    question: STRING
  }
  )
  return SecurityQuestion
}
