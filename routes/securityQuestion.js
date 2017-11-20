const models = require('../models/index')

exports = module.exports = function securityQuestion () {
  return (req, res, next) => {
    const email = req.query.email
    models.SecurityAnswer.find({
      include: [{
        model: models.User,
        where: { email: email }
      }]
    }).then(answer => {
      if (answer) {
        models.SecurityQuestion.findById(answer.SecurityQuestionId).then(question => {
          res.json({ question: question })
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
