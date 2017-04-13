'use strict'

var utils = require('../lib/utils')
var insecurity = require('../lib/insecurity')
var models = require('../models/index')
var cache = require('../data/datacache')
var challenges = cache.challenges

exports = module.exports = function changePassword () {
  return function (req, res, next) {
    var currentPassword = req.query.current
    var newPassword = req.query.new
    var repeatPassword = req.query.repeat
    if (!newPassword || newPassword === 'undefined') {
      res.status(401).send('Password cannot be empty.')
    } else if (newPassword !== repeatPassword) {
      res.status(401).send('New and repeated password do not match.')
    } else {
      var loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        if (currentPassword && insecurity.hash(currentPassword) !== loggedInUser.data.password) {
          res.status(401).send('Current password is not correct.')
        } else {
          models.User.find(loggedInUser.data.id).success(function (user) {
            user.updateAttributes({ password: newPassword }).success(function (user) {
              if (utils.notSolved(challenges.csrfChallenge) && user.id === 3) {
                if (user.password === insecurity.hash('slurmCl4ssic')) {
                  utils.solve(challenges.csrfChallenge)
                }
              }
              res.json({user: user})
            }).error(function (error) {
              next(error)
            })
          }).error(function (error) {
            next(error)
          })
        }
      } else {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
      }
    }
  }
}
