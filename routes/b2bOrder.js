const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const safeEval = require('safe-eval')
const challenges = require('../data/datacache').challenges

exports = module.exports = function b2bOrder () {
  return (req, res) => {
    const orderLinesData = req.body.orderLinesData || []
    orderLinesData.forEach(orderLineData => {
      try {
        safeEval(orderLineData, {}, { timeout: 2000 })
      } catch (err) {
        if (utils.notSolved(challenges.rceChallenge) && err.message === 'Script execution timed out.') {
          utils.solve(challenges.rceChallenge)
        }
      }
    })
    res.json({ cid: req.body.cid, orderNo: uniqueOrderNumber(), paymentDue: dateTwoWeeksFromNow() })
  }

  function uniqueOrderNumber () {
    return insecurity.hash(new Date() + '_B2B')
  }

  function dateTwoWeeksFromNow () {
    return new Date(new Date().getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString()
  }
}
