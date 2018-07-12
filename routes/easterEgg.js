const path = require('path')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = function serveEasterEgg () {
  return (req, res) => {
    if (utils.notSolved(challenges.easterEggLevelTwoChallenge)) {
      utils.solve(challenges.easterEggLevelTwoChallenge)
    }
    res.sendFile(path.resolve(__dirname, '../frontend/src/assets/private/threejs-demo.html'))
  }
}
