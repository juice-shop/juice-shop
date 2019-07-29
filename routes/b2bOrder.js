const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const safeEval = require('notevil')
const vm = require('vm')
const challenges = require('../data/datacache').challenges

module.exports = function b2bOrder () {
  return ({ body }, res, next) => {
    if (!utils.disableOnContainerEnv()) {
      const orderLinesData = body.orderLinesData || ''
      try {
        const sandbox = { safeEval, orderLinesData }
        vm.createContext(sandbox)
        vm.runInContext('safeEval(orderLinesData)', sandbox, { timeout: 2000 })
        res.json({ cid: body.cid, orderNo: uniqueOrderNumber(), paymentDue: dateTwoWeeksFromNow() })
      } catch (err) {
        if (err.message && err.message.match(/Script execution timed out.*/)) {
          if (utils.notSolved(challenges.rceOccupyChallenge)) {
            utils.solve(challenges.rceOccupyChallenge)
          }
          res.status(503)
          next(new Error('Sorry, we are temporarily not available! Please try again later.'))
        } else {
          if (utils.notSolved(challenges.rceChallenge) && err.message === 'Infinite loop detected - reached max iterations') {
            utils.solve(challenges.rceChallenge)
          }
          next(err)
        }
      }
    } else {
      res.json({ cid: body.cid, orderNo: uniqueOrderNumber(), paymentDue: dateTwoWeeksFromNow() })
    }
  }

  function uniqueOrderNumber () {
    return insecurity.hash(new Date() + '_B2B')
  }

  function dateTwoWeeksFromNow () {
    return new Date(new Date().getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString()
  }
}
