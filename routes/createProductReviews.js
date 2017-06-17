'use strict'

var utils = require('../lib/utils')

var Review = require('../mongoose/reviews').Review

exports = module.exports = function productReviews () {
  return function (req, res, next) {
    var review = new Review()

    review.product = req.params.id
    review.message = req.body.message
    review.author = req.body.author

    review.save().then(function (result) {
      res.json(utils.queryResultToJson(result))
    }, function (err) {
      res.json({error: 'Could not connect to MongoDB', trace: err})
    })
  }
}
