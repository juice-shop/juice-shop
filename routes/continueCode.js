'use strict'

var Hashids = require('hashids')
var hashids = new Hashids('this is my salt', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
var challenges = require('../data/datacache').challenges

exports = module.exports = function retrieveCurrentContinueCode () {
  return function (req, res) {
    var ids = []
    for (var name in challenges) {
      if (challenges.hasOwnProperty(name)) {
        if (challenges[name].solved) ids.push(challenges[name].id)
      }
    }
    var code = ids.length > 0 ? hashids.encode(ids) : undefined
    res.json({ continueCode: code })
  }
}
