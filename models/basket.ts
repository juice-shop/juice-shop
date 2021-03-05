/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
export = (sequelize, { STRING }) => {
  const Basket = sequelize.define('Basket', {
    coupon: STRING
  })

  Basket.associate = ({ User, Product, BasketItem }) => {
    Basket.belongsTo(User, { constraints: true, foreignKeyConstraint: true })
    Basket.belongsToMany(Product, { through: BasketItem, foreignKey: { name: 'BasketId', noUpdate: true } })
  }

  return Basket
}
