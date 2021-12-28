/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const security = require('../lib/insecurity')

module.exports.addBasketItem = function addBasketItem () {
  return (req, res, next) => {
    const result = utils.parseJsonCustom(req.rawBody)
    const productIds = []
    const basketIds = []
    const quantities = []

    for (let i = 0; i < result.length; i++) {
      if (result[i].key === 'ProductId') {
        productIds.push(result[i].value)
      } else if (result[i].key === 'BasketId') {
        basketIds.push(result[i].value)
      } else if (result[i].key === 'quantity') {
        quantities.push(result[i].value)
      }
    }

    const user = security.authenticatedUsers.from(req)
    if (user && basketIds[0] && basketIds[0] !== 'undefined' && user.bid != basketIds[0]) { // eslint-disable-line eqeqeq
      res.status(401).send('{\'error\' : \'Invalid BasketId\'}')
    } else {
      const basketItem = {
        ProductId: productIds[productIds.length - 1],
        BasketId: basketIds[basketIds.length - 1],
        quantity: quantities[quantities.length - 1]
      }
      utils.solveIf(challenges.basketManipulateChallenge, () => { return user && basketItem.BasketId && basketItem.BasketId !== 'undefined' && user.bid != basketItem.BasketId }) // eslint-disable-line eqeqeq

      const basketItemInstance = models.BasketItem.build(basketItem)
      basketItemInstance.save().then((basketItem) => {
        basketItem = {
          status: 'success',
          data: basketItem
        }
        res.json(basketItem)
      }).catch(error => {
        next(error)
      })
    }
  }
}

module.exports.quantityCheckBeforeBasketItemAddition = function quantityCheckBeforeBasketItemAddition () {
  return (req, res, next) => {
    void quantityCheck(req, res, next, req.body.ProductId, req.body.quantity).catch(error => {
      next(error)
    })
  }
}

module.exports.quantityCheckBeforeBasketItemUpdate = function quantityCheckBeforeBasketItemUpdate () {
  return (req, res, next) => {
    models.BasketItem.findOne({ where: { id: req.params.id } }).then((item) => {
      const user = security.authenticatedUsers.from(req)
      utils.solveIf(challenges.basketManipulateChallenge, () => { return user && req.body.BasketId && user.bid != req.body.BasketId }) // eslint-disable-line eqeqeq
      if (req.body.quantity) {
        void quantityCheck(req, res, next, item.ProductId, req.body.quantity)
      } else {
        next()
      }
    }).catch(error => {
      next(error)
    })
  }
}

async function quantityCheck (req, res, next, id, quantity) {
  const product = await models.Quantity.findOne({ where: { ProductId: id } })

  // is product limited per user and order, except if user is deluxe?
  if (!product.limitPerUser || (product.limitPerUser && product.limitPerUser >= quantity) || security.isDeluxe(req)) {
    if (product.quantity >= quantity) { // enough in stock?
      next()
    } else {
      res.status(400).json({ error: res.__('We are out of stock! Sorry for the inconvenience.') })
    }
  } else {
    res.status(400).json({ error: res.__('You can order only up to {{quantity}} items of this product.', { quantity: product.limitPerUser }) })
  }
}
