/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
const security = require('../lib/insecurity')

export = (sequelize, { STRING, INTEGER }) => {
  const SecurityAnswer = sequelize.define('SecurityAnswer', {
    answer: {
      type: STRING,
      set (answer) {
        this.setDataValue('answer', security.hmac(answer))
      }
    },
    UserId: { type: INTEGER, unique: true }
  })

  SecurityAnswer.associate = ({ User, SecurityQuestion }) => {
    SecurityAnswer.belongsTo(User)
    SecurityAnswer.belongsTo(SecurityQuestion, { constraints: true, foreignKeyConstraint: true })
  }

  return SecurityAnswer
}
