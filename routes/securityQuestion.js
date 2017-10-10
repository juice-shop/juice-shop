const models = require('../models/index')

exports = module.exports = function securityQuestion () {
  return (req, res, next) => {
    const email = req.query.email
    models.SecurityAnswer.find({
      include: [{
        model: models.User,
        where: { email: email }
      }]
    }).success(answer => {
      if (answer) {
        models.SecurityQuestion.find(answer.SecurityQuestionId).success(question => {
          res.json({ question: question })
        }).error(error => {
          next(error)
        })
      } else {
        res.json({})
      }
    }).error(error => {
      next(error)
    })
  }
}
