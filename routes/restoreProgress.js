'use strict'

var Hashids = require('hashids')
var hashids = new Hashids('this is my salt', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
var challenges = require('../data/datacache').challenges
var utils = require('../lib/utils')

exports = module.exports = function restoreProgress () {
  return function (req, res) {
    var continueCode = req.params.continueCode
    var ids = hashids.decode(continueCode)
    if (utils.notSolved(challenges.continueCodeChallenge) && ids.length === 1 && ids[ 0 ] === 99) {
      utils.solve(challenges.continueCodeChallenge)
      res.end()
    } else if (ids.length > 0) {
      for (var name in challenges) {
        if (challenges.hasOwnProperty(name)) {
          if (ids.indexOf(challenges[ name ].id) > -1) {
            utils.solve(challenges[ name ])
          }
        }
      }
      res.end()
    } else {
      res.status(404).send('Invalid continue code.')
    }
  }
}
