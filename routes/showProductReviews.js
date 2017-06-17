'use strict'

var utils = require('../lib/utils')
var challenges = require('../data/datacache').challenges

var connection = require('mongoose').connection
var Review = require('../mongoose/reviews').Review

exports = module.exports = function productReviews () {
  return function (req, res, next) {
    var id = req.params.id

    if (connection.readyState === 1) {
      // Messure how long the query takes to find out if an there was a nosql dos attack
      var t0 = new Date().getTime()
      Review.find({'$where': 'this.product == ' + id}).then(function (reviews) {
        if ((new Date().getTime() - t0) > 2000) {
          if (utils.notSolved(challenges.noSqlCommandChallenge)) {
            utils.solve(challenges.noSqlCommandChallenge)
          }
        }
        res.json(utils.queryResultToJson(reviews))
      }, function () {
        res.status(400).json({error: 'Wrong Params'})
      })
    } else {
      res.json({msg: 'No NoSQL Database availible'})
    }
  }
}
