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
        if (utils.notSolved(challenges.rceChallenge) && err.message === 'Infinite loop detected - reached max iterations') {
          utils.solve(challenges.rceChallenge)
          next(err)
        }
        if (utils.notSolved(challenges.rceOccupyChallenge) && err.message === 'Script execution timed out.') {
          utils.solve(challenges.rceOccupyChallenge)
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
