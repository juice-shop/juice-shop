'use strict'

var utils = require('../lib/utils')
var challenges = require('../data/datacache').challenges

var insecurity = require('../lib/insecurity')

var connection = require('mongoose').connection
var Review = require('../mongoose/reviews').Review

exports = module.exports = function productReviews () {
  return function (req, res, next) {
    var id = req.body.id

    if (!insecurity.isAuthorized()) {
      res.status(401).json({msg: 'You need to be authorized to do this!'})
    } else if (connection.readyState === 1) {
      // Updates the comments
      // insecurity as it updates all the comments and doesnt filter for the user
      // also updateOne() or findOneAndUpdate() would be more suitible here
      Review.updateMany({_id: id}, {message: req.body.message}, {runValidators: false})
        .then(function (result) {
          if (result.nModified > 1) {
            // More then one Review was modified => challange solved
            if (utils.notSolved(challenges.noSqlInjectionChallenge)) {
              utils.solve(challenges.noSqlInjectionChallenge)
            }
          }
          res.json(result)
        }, function (err) {
          res.status(500).json(err)
        })
    } else {
      res.json({msg: 'No NoSQL Database availible'})
    }
  }
}
