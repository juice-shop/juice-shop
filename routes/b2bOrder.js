const utils = require('../lib/utils')
const safeEval = require('safe-eval')
const challenges = require('../data/datacache').challenges

exports = module.exports = function b2bOrder () {
  return (req, res) => {
    const orderLines = req.body.orderLines | []
    const orderLinesDate = req.body.orderLinesData
    orderLinesDate.forEach(orderLineData => {
      try {
        orderLines.push(safeEval(orderLineData, {}, { timeout: 1000 }))
      } catch (err) {
        if (utils.notSolved(challenges.rceChallenge) && err.message === 'Script execution timed out.') {
          utils.solve(challenges.rceChallenge)
        }
      }
    })
    let orderConfirmation = { cid: req.body.cid, orderLines, total: 0, paymentDue: dateTwoWeeksFromNow() }
    res.json(orderConfirmation)
  }

  function dateTwoWeeksFromNow () {
    return new Date(new Date().getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString()
  }
}
