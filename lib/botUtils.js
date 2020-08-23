/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */
const models = require('../models/index')
const fuzz = require('fuzzball')

async function productPrice (query) {
  const [products] = await models.sequelize.query('SELECT * FROM Products')
  const queriedProducts = products
    .filter((product) => fuzz.partial_ratio(query, product.name) > 75)
    .map((product) => `${product.name}: ${product.price}`)
  return {
    action: 'response',
    body: queriedProducts.length > 0 ? queriedProducts.join(`
    `) : 'Sorry I couldn\'t find any products with that name'
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
