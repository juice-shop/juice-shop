/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
module.exports = (sequelize, { INTEGER }) => {
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
