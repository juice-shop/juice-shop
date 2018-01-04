const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const serializer = require('node-serialize')
const vm = require('vm')

exports = module.exports = function b2bOrder () {
  return (req, res) => {
    const orderLines = req.body.orderLinesData
    orderLines.forEach(orderLine => {
      try {
        vm.runInNewContext('serializer.unserialize(orderLine)', { serializer, orderLine }, { timeout: 2000 })
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
