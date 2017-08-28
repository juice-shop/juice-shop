'use strict'

const models = require('../models/index')

exports = module.exports = function securityQuestion () {
  return function (req, res, next) {
    const email = req.query.email
    models.SecurityAnswer.find({
      include: [{
        model: models.User,
        where: { email: email }
      }]
    }).success(function (answer) {
      if (answer) {
        models.SecurityQuestion.find(answer.SecurityQuestionId).success(function (question) {
          res.json({ question: question })
        }).error(function (error) {
          next(error)
        })
      } else {
        res.json({})
      }
    }).error(function (error) {
      next(error)
    })
  }
}
