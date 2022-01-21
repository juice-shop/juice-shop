/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
export = (sequelize, { INTEGER, BOOLEAN, DATE }) => {
  const Recycle = sequelize.define('Recycle', {
    quantity: INTEGER(4),
    isPickup: { type: BOOLEAN, defaultValue: false },
    date: DATE
  })

  Recycle.associate = ({ User, Address }) => {
    Recycle.belongsTo(User, { constraints: true, foreignKeyConstraint: true })
    Recycle.belongsTo(Address, { constraints: true, foreignKeyConstraint: true })
  }

  return Recycle
}
