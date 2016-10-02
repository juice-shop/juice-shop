'use strict'

var Hashids = require('hashids')
var hashids = new Hashids('OWASP Juice Shop', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
var challenges = require('../data/datacache').challenges
var utils = require('../lib/utils')

exports = module.exports = function restoreProgress () {
  return function (req, res) {
    var continueCode = req.params.continueCode
    var ids = hashids.decode(continueCode)
    for (var name in challenges) {
      if (challenges.hasOwnProperty(name)) {
        if (ids.indexOf(challenges[name].id) > -1) {
          utils.solve(challenges[name])
        }
      }
    }
    res.end()
  }
}
