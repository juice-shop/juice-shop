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
  const queriedProducts = []
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

module.exports = {
  productPrice
}
