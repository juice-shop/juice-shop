'use strict'

var utils = require('../lib/utils')
var challenges = require('../data/datacache').challenges
var insecurity = require('../lib/insecurity')
var models = require('../models/index')

exports = module.exports = function resetPassword () {
  return function (req, res, next) {
    var email = req.body.email
    var answer = req.body.answer
    var newPassword = req.body.new
    var repeatPassword = req.body.repeat
    if (!email || !answer) {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    } else if (!newPassword || newPassword === 'undefined') {
      res.status(401).send('Password cannot be empty.')
    } else if (newPassword !== repeatPassword) {
      res.status(401).send('New and repeated password do not match.')
    } else {
      models.SecurityAnswer.find({
        include: [{
          model: models.User,
          where: { email: email }
        }]
      }).success(function (data) {
        if (insecurity.hmac(answer) === data.answer) {
          models.User.find(data.UserId).success(function (user) {
            user.updateAttributes({ password: newPassword }).success(function (user) {
              if (utils.notSolved(challenges.resetPasswordJimChallenge) && user.id === 2 && answer === 'Samuel') {
                utils.solve(challenges.resetPasswordJimChallenge)
              }
              if (utils.notSolved(challenges.resetPasswordBenderChallenge) && user.id === 3 && answer === 'Stop\'n\'Drop') {
                utils.solve(challenges.resetPasswordBenderChallenge)
              }
              if (utils.notSolved(challenges.resetPasswordBjoernChallenge) && user.id === 4 && answer === 'West-2082') {
                utils.solve(challenges.resetPasswordBjoernChallenge)
              }
              res.json({user: user})
            }).error(function (error) {
              next(error)
            })
          }).error(function (error) {
            next(error)
          })
        } else {
          res.status(401).send('Wrong answer to security question.')
        }
      }).error(function (error) {
        next(error)
      })
    }
  }
}
