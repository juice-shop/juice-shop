const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const models = require('../models/index')
const challenges = require('../data/datacache').challenges

exports = module.exports = function retrieveBasket () {
  return (req, res, next) => {
    const id = req.params.id
    models.Basket.find({ where: { id: id }, include: [ models.Product ] })
      .success(basket => {
        /* jshint eqeqeq:false */
        if (utils.notSolved(challenges.basketChallenge)) {
          const user = insecurity.authenticatedUsers.from(req)
          if (user && id && id !== 'undefined' && user.bid != id) { // eslint-disable-line eqeqeq
            utils.solve(challenges.basketChallenge)
          }
        }
        res.json(utils.queryResultToJson(basket))
      }).error(error => {
        next(error)
      })
  }
}
