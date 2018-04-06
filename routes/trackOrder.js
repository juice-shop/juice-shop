const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = function trackOrder () {
  return (req, res) => {
    if (utils.notSolved(challenges.reflectedXssChallenge) && utils.contains(req.query.id, '<img src=x onerror=alert("XSS")>')) {
      utils.solve(challenges.reflectedXssChallenge)
    }
    res.json({'id': req.query.id,
      'more': 'Coming Soon.'
    })
  }
}
