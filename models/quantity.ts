/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
export = (sequelize, { INTEGER }) => {
  const Quantity = sequelize.define('Quantity', {
    quantity: {
      type: INTEGER,
      validate: {
        isInt: true
      }
    },
    limitPerUser: {
      type: INTEGER,
      validate: {
        isInt: true
      },
      defaultValue: null
    }
  })

  Quantity.associate = ({ Product }) => {
    Quantity.belongsTo(Product, { constraints: true, foreignKeyConstraint: true })
  }

  return Quantity
}
