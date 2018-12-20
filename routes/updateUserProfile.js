const models = require('../models/index')
const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = function updateUserProfile () {
  return (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
    req.body.username = decodeURIComponent(req.body.username)
    if (utils.notSolved(challenges.usernameXssChallenge) && utils.contains(req.body.username, '<iframe src="javascript:alert(`xss`)">')) {
      utils.solve(challenges.usernameXssChallenge)
    }
    var flag = true
    if (req.body.username.includes('<script') || req.body.username.includes('onload')) {
      flag = false
    }
    if (loggedInUser && flag) {
      models.User.findByPk(loggedInUser.data.id).then(user => {
        return user.updateAttributes({ username: req.body.username })
      }).catch(error => {
        next(error)
      })
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
    res.location('/profile')
    res.redirect('/profile')
  }
}
