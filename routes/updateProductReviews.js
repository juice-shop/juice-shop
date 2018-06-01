const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')

module.exports = function productReviews () {
  return ({body}, res, next) => {
    const id = body.id

    db.reviews.update(
      { _id: id },
      { '$set': { message: body.message } },
      { multi: true }
    ).then(
      result => {
        if (result.modified > 1 && utils.notSolved(challenges.noSqlReviewsChallenge)) {
          // More then one Review was modified => challange solved
          utils.solve(challenges.noSqlReviewsChallenge)
        }
        res.json(result)
      }, err => {
        res.status(500).json(err)
      })
  }
}
