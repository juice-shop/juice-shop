const path = require('path')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = function servePremiumContent () {
  return (req, res) => {
    if (utils.notSolved(challenges.premiumPaywallChallenge)) {
      utils.solve(challenges.premiumPaywallChallenge)
    }
    res.sendFile(path.resolve(__dirname, '../frontend/src/assets/private/under-construction.gif'))
  }
}
