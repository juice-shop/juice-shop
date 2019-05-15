const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const insecurity = require('../lib/insecurity')
const models = require('../models/index')

function addBasketItem () {
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

addBasketItem.quantityCheck = () => async (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    var result = utils.parseJsonCustom(req.rawBody)
    var productId = 0
    var reqQuantity = 0
    if (req.method === 'POST') {
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

      productId = productIds[0]
      reqQuantity = quantities[0]
    } else if (req.method === 'PUT') {
      var pID = req.url.replace('/', '')
      await models.BasketItem.findAll({ where: { id: pID } }).then((item) => {
        productId = item[0].dataValues.ProductId
        reqQuantity = result[0].value
      }).catch(error => {
        next(error)
      })
    }

    models.Quantity.findOne({ where: { ProductId: productId } }).then((product) => {
      if (product.dataValues.quantity < reqQuantity) {
        res.status(401).send(JSON.stringify({ 'error': 'Stock Out, Please wait for a refill' }))
      } else {
        next()
      }
    }).catch(error => {
      next(error)
    })
  } else {
    next()
  }
}

module.exports = addBasketItem
