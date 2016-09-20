'use strict'

var utils = require('../lib/utils')
var insecurity = require('../lib/insecurity')
var challenges = require('../data/datacache').challenges

exports = module.exports = function performRedirect () {
  return function (req, res, next) {
    var toUrl = req.query.to
    if (insecurity.isRedirectAllowed(toUrl)) {
      if (utils.notSolved(challenges.redirectChallenge) && isUnintendedRedirect(toUrl)) {
        utils.solve(challenges.redirectChallenge)
      }
      res.redirect(toUrl)
    } else {
      res.status(406)
      next(new Error('Unrecognized target URL for redirect: ' + toUrl))
    }
  }
}

function isUnintendedRedirect (toUrl) {
  var unintended = true
  insecurity.redirectWhitelist.forEach(function (allowedUrl) {
    unintended = unintended && !utils.startsWith(toUrl, allowedUrl)
  })
  return unintended
}
