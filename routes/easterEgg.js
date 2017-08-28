const path = require('path')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

exports = module.exports = function serveEasterEgg () {
  return (req, res) => {
    if (utils.notSolved(challenges.easterEggLevelTwoChallenge)) {
      utils.solve(challenges.easterEggLevelTwoChallenge)
    }
    res.sendFile(path.resolve(__dirname, '../app/private/threejs-demo.html'))
  }
}
