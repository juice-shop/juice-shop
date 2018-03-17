const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const challenges = require('../data/datacache').challenges

exports = module.exports = function performRedirect () {
  return ({query}, res, next) => {
    const toUrl = query.to
    if (insecurity.isRedirectAllowed(toUrl)) {
      if (utils.notSolved(challenges.redirectGratipayChallenge) && toUrl === 'https://gratipay.com/juice-shop') {
        utils.solve(challenges.redirectGratipayChallenge)
      }
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
  let unintended = true
  insecurity.redirectWhitelist.forEach(allowedUrl => {
    unintended = unintended && !utils.startsWith(toUrl, allowedUrl)
  })
  return unintended
}
