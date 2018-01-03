const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
var serialize = require('serialize-to-js')

exports = module.exports = function b2bOrder () {
  return (req, res) => {
    const orderLines = req.body.orderLinesData
    orderLines.forEach(orderLine => {
      console.log(serialize.deserialize(orderLine))
      if (utils.notSolved(challenges.rceChallenge)) { // TODO Verify if "dir" or "ls" have been spawned on the server
        utils.solve(challenges.rceChallenge)
      }
    })
    res.end()
  }
}
