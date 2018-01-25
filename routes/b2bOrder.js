const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const safeEval = require('notevil')
const vm = require('vm')
const challenges = require('../data/datacache').challenges

exports = module.exports = function b2bOrder () {
  return (req, res, next) => {
    const orderLinesData = req.body.orderLinesData || []
    orderLinesData.forEach(orderLineData => {
      try {
        const sandbox = { safeEval, orderLineData }
        vm.createContext(sandbox)
        vm.runInContext('safeEval(orderLineData)', sandbox, { timeout: 2000 })
      } catch (err) {
        if (err.message === 'Infinite loop detected - reached max iterations') {
          if (utils.notSolved(challenges.rceChallenge)) {
            utils.solve(challenges.rceChallenge)
          }
          next(err)
        } else if (err.message === 'Script execution timed out.') {
          if (utils.notSolved(challenges.rceOccupyChallenge)) {
            utils.solve(challenges.rceOccupyChallenge)
          }
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
