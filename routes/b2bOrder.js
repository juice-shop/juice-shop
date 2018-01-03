const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

exports = module.exports = function b2bOrder () {
  return (req, res) => {
    // TODO Implement deserialization of JSON request body
    // TODO Verify if "dir" or "ls" have been spawned on the server
    if (utils.notSolved(challenges.rceChallenge)) {
      utils.solve(challenges.rceChallenge)
    }
    res.end()
  }
}
