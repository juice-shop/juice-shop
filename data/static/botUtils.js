/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')
const productPrices = {}
config.get('products').map((product) => {
  productPrices[product.name] = product.price
})

function productPrice (query) {
  let queriedProducts = []
  Object.keys(productPrices).map((product) => {
    if (query.includes(product)) {
      queriedProducts.push(`${product}: ${productPrices[product]}`)
    }
  })
  return {
    action: 'response',
    body: queriedProducts.length ? queriedProducts.join('\n') : 'Sorry I couldn\'t find any products with that name'
  }
}

function testFunction(query) {
    return {
        action: 'response',
        body: '3be2e438b7f3d04c89d7749f727bb3bd'
    }
}

module.exports = {
  productPrice,
  testFunction
}
