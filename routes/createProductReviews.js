const db = require('../data/mongodb')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const insecurity = require('../lib/insecurity')

module.exports = function productReviews () {
  return (req, res, next) => {
    const user = insecurity.authenticatedUsers.from(req)
    if (user && user.data.email !== req.body.author && utils.notSolved(challenges.forgedReviewChallenge)) {
      utils.solve(challenges.forgedReviewChallenge)
    }
    db.reviews.insert({
      product: req.params.id,
      message: req.body.message,
      author: req.body.author,
      likesCount: 0,
      likedBy: []
    }).then(result => {
      res.status(201).json({ staus: 'success' })
    }, err => {
      res.status(500).json(err)
    })
  }
}
