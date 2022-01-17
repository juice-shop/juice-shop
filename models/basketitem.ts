/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
export = (sequelize, { INTEGER }) => {
  const BasketItem = sequelize.define('BasketItem', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    quantity: INTEGER
  }
  )
  return BasketItem
}
