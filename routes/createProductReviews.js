const db = require('../data/mongodb')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const insecurity = require('../lib/insecurity')

module.exports = function productReviews () {
  return (req, res, next) => {
    const user = insecurity.authenticatedUsers.from(req)
    if (user.data.email !== req.body.author && utils.notSolved(challenges.privilegeEscalationChallenge)) {
      utils.solve(challenges.privilegeEscalationChallenge)
    }
    db.reviews.insert({
      product: req.params.id,
      message: req.body.message,
      author: req.body.author
    }).then(result => {
      res.status(201).json({ staus: 'success' })
    }, err => {
      res.status(500).json(err)
    })
  }
}
