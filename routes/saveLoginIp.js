const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const models = require('../models/index')
const cache = require('../data/datacache')
const challenges = cache.challenges

module.exports = function saveLoginIp () {
  return (req, res, next) => {
    var loggedInUser = insecurity.authenticatedUsers.from(req)
    if (loggedInUser !== undefined) {
      var lastLoginIp = req.headers['true-client-ip']
      if (utils.notSolved(challenges.httpHeaderXssChallenge) && lastLoginIp === '<iframe src="javascript:alert(`xss`)>') {
        utils.solve(challenges.httpHeaderXssChallenge)
      }
      if (lastLoginIp === undefined) {
        lastLoginIp = req.connection.remoteAddress
      }
      if (utils.startsWith(lastLoginIp, '::ffff:')) { // Simplify ipv4 addresses
        lastLoginIp = lastLoginIp.substr(7)
      } else if (lastLoginIp === '::1') {
        lastLoginIp = '127.0.0.1'
      }
      models.User.findByPk(loggedInUser.data.id).then(user => {
        user.update({ lastLoginIp: lastLoginIp }).then(user => {
          res.json(user)
        }).catch(error => {
          next(error)
        })
      }).catch(error => {
        next(error)
      })
    } else {
      res.sendStatus(401)
    }
  }
}
