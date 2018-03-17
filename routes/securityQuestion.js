const models = require('../models/index')

exports = module.exports = function securityQuestion () {
  return ({query}, res, next) => {
    const email = query.email
    models.SecurityAnswer.find({
      include: [{
        model: models.User,
        where: { email }
      }]
    }).then(answer => {
      if (answer) {
        models.SecurityQuestion.findById(answer.SecurityQuestionId).then(question => {
          res.json({ question })
        }).catch(error => {
          next(error)
        })
      } else {
        res.json({})
      }
    }).catch(error => {
      next(error)
    })
  }
}
