const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')

module.exports = function trackOrder () {
  return (req, res) => {
    const id = utils.disableOnContainerEnv() ? String(req.params.id).replace(/[^\w-]+/g, '') : req.params.id

    if (utils.notSolved(challenges.reflectedXssChallenge) && utils.contains(id, '<iframe src="javascript:alert(`xss`)">')) {
      utils.solve(challenges.reflectedXssChallenge)
    }
    db.orders.find({ $where: `this.orderId === '${id}'` }).then(order => {
      const result = utils.queryResultToJson(order)
      if (utils.notSolved(challenges.noSqlOrdersChallenge) && result.data.length > 1) {
        utils.solve(challenges.noSqlOrdersChallenge)
      }
      if (result.data[0] === undefined) {
        result.data[0] = { orderId: id }
      }
      res.json(result)
    }, () => {
      res.status(400).json({ error: 'Wrong Param' })
    })
  }
}
