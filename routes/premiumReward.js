const path = require('path')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

exports = module.exports = function servePremiumContent () {
  return (req, res) => {
    if (utils.notSolved(challenges.premiumPaywallChallenge)) {
      utils.solve(challenges.premiumPaywallChallenge)
    }
    res.sendFile(path.resolve(__dirname, '../app/private/under-construction.gif'))
  }
}
