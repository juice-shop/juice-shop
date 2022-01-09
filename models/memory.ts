/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
export = (sequelize, { STRING, INTEGER }) => {
  const Memory = sequelize.define('Memory', {
    caption: STRING,
    imagePath: STRING
  })

  Memory.associate = ({ User }) => {
    Memory.belongsTo(User, { constraints: true, foreignKeyConstraint: true })
  }

  return Memory
}
