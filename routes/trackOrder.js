const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')

module.exports = function trackOrder () {
  return (req, res) => {
    if (utils.notSolved(challenges.reflectedXssChallenge) && utils.contains(req.query.id, '<script>alert("XSS")</script>')) {
      utils.solve(challenges.reflectedXssChallenge)
    }
    db.orders.find({ orderNo: req.query.id }).then(order => {
      const result = utils.queryResultToJson(order)
      res.json(result)
    }, () => {
      res.status(400).json({ error: 'Wrong Param' })
    })
  }
}
