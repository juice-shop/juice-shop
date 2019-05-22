const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const insecurity = require('../lib/insecurity')
const models = require('../models/index')

module.exports.addBasketItem = function addBasketItem () {
  return (req, res, next) => {
    var result = utils.parseJsonCustom(req.rawBody)
    var productIds = []
    var basketIds = []
    var quantities = []

    for (var i = 0; i < result.length; i++) {
      if (result[i].key === 'ProductId') {
        productIds.push(result[i].value)
      } else if (result[i].key === 'BasketId') {
        basketIds.push(result[i].value)
      } else if (result[i].key === 'quantity') {
        quantities.push(result[i].value)
      }
    }

    const user = insecurity.authenticatedUsers.from(req)
    if (user && basketIds[0] && basketIds[0] !== 'undefined' && user.bid != basketIds[0]) { // eslint-disable-line eqeqeq
      res.status(401).send('{\'error\' : \'Invalid BasketId\'}')
    } else {
      const basketItem = {
        ProductId: productIds[productIds.length - 1],
        BasketId: basketIds[basketIds.length - 1],
        quantity: quantities[quantities.length - 1]
      }

      if (utils.notSolved(challenges.basketManipulateChallenge)) {
        if (user && basketItem.BasketId && basketItem.BasketId !== 'undefined' && user.bid != basketItem.BasketId) { // eslint-disable-line eqeqeq
          utils.solve(challenges.basketManipulateChallenge)
        }
      }

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
    quantityCheck(req, res, next, req.body.ProductId, req.body.quantity)
  }
}

module.exports.quantityCheckBeforeBasketItemUpdate = function quantityCheckBeforeBasketItemUpdate () {
  return (req, res, next) => {
    models.BasketItem.findAll({ where: { id: req.params.id } }).then((item) => {
      if (req.body.quantity !== null) {
        quantityCheck(req, res, next, item[0].dataValues.ProductId, req.body.quantity)
      } else {
        next()
      }
    }).catch(error => {
      next(error)
    })
  }
}

function quantityCheck (req, res, next, id, quantity) {
  models.Quantity.findOne({ where: { ProductId: id } }).then((product) => {
    if (product.dataValues.quantity < quantity) {
      res.status(400).json({ error: 'Stock Out, Please wait for a refill' })
    } else {
      next()
    }
  }).catch(error => {
    next(error)
  })
}
