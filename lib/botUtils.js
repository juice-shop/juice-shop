/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */
const models = require('../models/index')
const utils = require('./utils')

async function productPrice (query) {
  const [products] = await models.sequelize.query(`SELECT * FROM Products WHERE ((name LIKE '%%' OR description LIKE '%${query}%') AND deletedAt IS NULL) ORDER BY name`)
  const queriedProducts = []
  Object.keys(product).map((product) => {
    if (query.includes(product.name)) {
      queriedProducts.push(`${product.name}: ${product.price}`)
    }
  })
  return {
    action: 'response',
    body: queriedProducts.length ? queriedProducts.join('\n') : 'Sorry I couldn\'t find any products with that name'
  }
}

function testFunction (query) {
  return {
    action: 'response',
    body: '3be2e438b7f3d04c89d7749f727bb3bd'
  }
}

module.exports = {
  productPrice,
  testFunction
}
