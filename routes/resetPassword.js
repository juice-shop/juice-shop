'use strict'

var insecurity = require('../lib/insecurity')
var models = require('../models/index')

exports = module.exports = function resetPassword () {
  return function (req, res, next) {
    var email = req.body.email
    var answer = req.body.answer
    var newPassword = req.body.new
    var repeatPassword = req.body.repeat
    if (!newPassword || newPassword === 'undefined') {
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
