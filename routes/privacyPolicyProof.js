const path = require('path')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = function servePrivacyPolicyProof () {
  return (req, res) => {
    if (utils.notSolved(challenges.privacyPolicyProofChallenge)) {
      utils.solve(challenges.privacyPolicyProofChallenge)
    }
    res.sendFile(path.resolve(__dirname, '../frontend/dist/frontend/assets/private/thank-you.jpg'))
  }
}
