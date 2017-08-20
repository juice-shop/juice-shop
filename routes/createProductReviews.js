'use strict'

var utils = require('../lib/utils')

var db = require('../mongodb/index')

exports = module.exports = function productReviews () {
  return function (req, res, next) {
    db.reviews.insert({
      product: req.params.id,
      message: req.body.message,
      author: req.body.author
    }).then(function (result) {
      res.json(utils.queryResultToJson(result))
    }, function (err) {
      res.status(500).json(err)
    })
  }
}
