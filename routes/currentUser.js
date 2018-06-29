const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const cache = require('../data/datacache')
const challenges = cache.challenges

module.exports = function retrieveLoggedInUser () {
  return (req, res) => {
    const user = insecurity.authenticatedUsers.get(req.cookies.token)
    const response = { user: { id: (user && user.data ? user.data.id : undefined), email: (user && user.data ? user.data.email : undefined) } };
    if (req.query.callback === undefined) {
      res.json(response)
    } else {
      if (utils.notSolved(challenges.emailLeakChallenge)) {
        utils.solve(challenges.emailLeakChallenge)
      }
      res.jsonp(response)
    }
  }
}
