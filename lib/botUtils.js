/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */
const models = require('../models/index')
const fuzz = require('fuzzball')
const insecurity = require('./insecurity')
const utils = require('./utils')
const challenges = require('../data/datacache').challenges

async function productPrice (query, user) {
  const [products] = await models.sequelize.query('SELECT * FROM Products')
  const queriedProducts = products
    .filter((product) => fuzz.partial_ratio(query, product.name) > 75)
    .map((product) => `${product.name} costs ${product.price}¤`)
  return {
    action: 'response',
    body: queriedProducts.length > 0 ? queriedProducts.join(', ') : 'Sorry I couldn\'t find any products with that name'
  }
}

function couponCode (query, user) {
  utils.solveIf(challenges.bullyChatbotChallenge, () => { return true })
  return {
    action: 'response',
    body: `Oooookay, if you promise to stop nagging me here's a 10% coupon code for you: ${insecurity.generateCoupon(10)}`
  }
}

function testFunction (query, user) {
  return {
    action: 'response',
    body: '3be2e438b7f3d04c89d7749f727bb3bd'
  }
}

module.exports = {
  productPrice,
  couponCode,
  testFunction
}
