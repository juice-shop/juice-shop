const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const cache = require('../data/datacache')
const challenges = cache.challenges

module.exports = function retrieveLoggedInUser () {
  return (req, res) => {
    let user
    try {
      if (insecurity.verify(req.cookies.token)) {
        user = insecurity.authenticatedUsers.get(req.cookies.token)
      }
    } catch (err) {
      user = undefined
    } finally {
      const response = { user: { id: (user && user.data ? user.data.id : undefined), email: (user && user.data ? user.data.email : undefined), lastLoginIp: (user && user.data ? user.data.lastLoginIp : undefined), profileImage: (user && user.data ? user.data.profileImage : undefined) } }
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
}
