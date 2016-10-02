'use strict'

var Hashids = require('hashids')
var hashids = new Hashids('OWASP Juice Shop', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
var challenges = require('../data/datacache').challenges

exports = module.exports = function retrieveCurrentContinueCode () {
  return function (req, res) {
    var ids = []
    for (var name in challenges) {
      if (challenges.hasOwnProperty(name)) {
        if (challenges[name].solved) ids.push(challenges[name].id)
      }
    }
    res.json({ continueCode: hashids.encode(ids) })
  }
}
