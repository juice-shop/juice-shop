const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const serializer = require('serialize-to-js')
const vm = require('vm')

exports = module.exports = function b2bOrder () {
  return (req, res) => {
    const orderLines = req.body.orderLinesData
    orderLines.forEach(orderLine => {
      const sandbox = { serializer, orderLine }
      vm.createContext(sandbox)
      try {
        vm.runInContext('serializer.deserialize(orderLine)', sandbox, { timeout: 2000 })
      } catch (err) {
        console.log(err)
        if (utils.notSolved(challenges.rceChallenge) && err.message === 'Script execution timed out.') {
          utils.solve(challenges.rceChallenge)
        }
      }
    })
    res.end()
  }
}
