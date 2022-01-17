/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export = (sequelize, { FLOAT, STRING }) => {
  const Delivery = sequelize.define('Delivery', {
    name: STRING,
    price: FLOAT,
    deluxePrice: FLOAT,
    eta: FLOAT,
    icon: STRING
  })

  return Delivery
}
