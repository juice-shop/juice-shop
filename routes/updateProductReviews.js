'use strict'

const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')

exports = module.exports = function productReviews () {
  return function (req, res, next) {
    const id = req.body.id

    db.reviews.update(
      { _id: id },
      { '$set': { message: req.body.message } },
      { multi: true }
    ).then(
      function (result) {
        if (result.modified > 1 && utils.notSolved(challenges.noSqlInjectionChallenge)) {
          // More then one Review was modified => challange solved
          utils.solve(challenges.noSqlInjectionChallenge)
        }
        res.json(result)
      }, function (err) {
        res.status(500).json(err)
      })
  }
}
