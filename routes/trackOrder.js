const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')

module.exports = function trackOrder () {
  return (req, res) => {
    if (utils.notSolved(challenges.reflectedXssChallenge) && utils.contains(req.params.id, '<script>alert("XSS")</script>')) {
      utils.solve(challenges.reflectedXssChallenge)
    }
    db.orders.find({ orderId: req.params.id }).then(order => {
      const result = utils.queryResultToJson(order)
      if (result.data[0] === undefined) {
        result.data[0] = {orderId: req.params.id}
      }
      res.json(result)
    }, () => {
      res.status(400).json({ error: 'Wrong Param' })
    })
  }
}
