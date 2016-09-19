'use strict'

var path = require('path')
var utils = require('../lib/utils')
var challenges = require('../data/datacache').challenges

exports = module.exports = function serveEasterEgg () {
  return function (req, res) {
    if (utils.notSolved(challenges.easterEggLevelTwoChallenge)) {
      utils.solve(challenges.easterEggLevelTwoChallenge)
    }
    res.sendFile(path.resolve(__dirname, '../app/private/threejs-demo.html'))
  }
}
