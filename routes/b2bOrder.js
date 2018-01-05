const utils = require('../lib/utils')
const safeEval = require('safe-eval')
const challenges = require('../data/datacache').challenges

exports = module.exports = function b2bOrder () {
  return (req, res) => {
    const orderLines = req.body.orderLines | []
    const orderLinesDate = req.body.orderLinesData
    let totalQuantity = 0
    orderLinesDate.forEach(orderLineData => {
      try {
        const deserializedOrderLine = safeEval(orderLineData, {}, { timeout: 2000 }) | {}
        const orderLine = { productId: deserializedOrderLine.productId, quantity: deserializedOrderLine.quantity }
        if (deserializedOrderLine.customerReference) {
          orderLine.customerReference = deserializedOrderLine.customerReference.toString()
        }
        totalQuantity += orderLine.quantity
        orderLines.push(orderLine)
      } catch (err) {
        if (utils.notSolved(challenges.rceChallenge) && err.message === 'Script execution timed out.') {
          utils.solve(challenges.rceChallenge)
        }
      }
    })
    res.json({ cid: req.body.cid, orderLines: orderLines, totalQuantity: totalQuantity, paymentDue: dateTwoWeeksFromNow() })
  }

  function dateTwoWeeksFromNow () {
    return new Date(new Date().getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString()
  }
}
