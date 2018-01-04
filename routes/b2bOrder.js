const utils = require('../lib/utils')
const safeEval = require('safe-eval')
const challenges = require('../data/datacache').challenges

exports = module.exports = function b2bOrder () {
  return (req, res) => {
    const orderLines = req.body.orderLinesData
    let orderConfirmation = { cid: req.body.cid }
    orderLines.forEach(orderLine => {
      try {
        safeEval(orderLine, {}, { timeout: 1000 })
      } catch (err) {
        if (utils.notSolved(challenges.rceChallenge) && err.message === 'Script execution timed out.') {
          utils.solve(challenges.rceChallenge)
        }
      }
    })
    res.json(orderConfirmation)
  }
}
