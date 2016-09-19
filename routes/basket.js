'use strict'

var utils = require('../lib/utils')
var insecurity = require('../lib/insecurity')
var models = require('../models/index')
var challenges = require('../data/datacache').challenges

exports = module.exports = function retrieveBasket () {
  return function (req, res, next) {
    var id = req.params.id
    models.Basket.find({ where: { id: id }, include: [ models.Product ] })
      .success(function (basket) {
        /* jshint eqeqeq:false */
        if (utils.notSolved(challenges.basketChallenge)) {
          var user = insecurity.authenticatedUsers.from(req)
          if (user && id && id !== 'undefined' && user.bid != id) { // eslint-disable-line eqeqeq
            utils.solve(challenges.basketChallenge)
          }
        }
        res.json(utils.queryResultToJson(basket))
      }).error(function (error) {
        next(error)
      })
  }
}
