/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
module.exports = (sequelize, { STRING, INTEGER, BOOLEAN, NUMBER }) => {
  const Challenge = sequelize.define('Challenge', {
    key: STRING,
    name: STRING,
    category: STRING,
    tag: STRING,
    description: STRING,
    difficulty: INTEGER,
    hint: STRING,
    hintUrl: STRING,
    mitigationUrl: STRING,
    solved: BOOLEAN,
    disabledEnv: STRING,
    tutorialOrder: NUMBER
  })
  return Challenge
}
