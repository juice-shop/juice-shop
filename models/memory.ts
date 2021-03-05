/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
module.exports = (sequelize, { STRING, INTEGER }) => {
  const Memory = sequelize.define('Memory', {
    caption: STRING,
    imagePath: STRING
  })

  Memory.associate = ({ User }) => {
    Memory.belongsTo(User, { constraints: true, foreignKeyConstraint: true })
  }

  return Memory
}
