'use strict'

var utils = require('../lib/utils')
var challenges = require('../data/datacache').challenges

var db = require('../data/mongodb')

// Blocking sleep function as in native MongoDB
global.sleep = function (time) {
  // Ensure that users dont accidentally dos their servers for too long
  if (time > 2000) {
    time = 2000
  }
  var stop = new Date().getTime()
  while (new Date().getTime() < stop + time) {
    ;
  }
}

exports = module.exports = function productReviews () {
  return function (req, res, next) {
    var id = req.params.id

    // Messure how long the query takes to find out if an there was a nosql dos attack
    var t0 = new Date().getTime()
    db.reviews.find({ '$where': 'this.product == ' + id }).then(function (reviews) {
      var t1 = new Date().getTime()
      if ((t1 - t0) > 2000) {
        if (utils.notSolved(challenges.noSqlCommandChallenge)) {
          utils.solve(challenges.noSqlCommandChallenge)
        }
      }
      res.json(utils.queryResultToJson(reviews))
    }, function () {
      res.status(400).json({ error: 'Wrong Params' })
    })
  }
}
