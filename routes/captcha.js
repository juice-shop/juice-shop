const models = require('../models/index')

exports = module.exports = function captchas () {
  return (req, res) => {
    var captchaId = req.app.locals.captchaId++
    var operators = ['*', '+', '-']

    var firstTerm = Math.floor((Math.random() * 10) + 1)
    var secondTerm = Math.floor((Math.random() * 10) + 1)
    var thirdTerm = Math.floor((Math.random() * 10) + 1)

    var firstOperator = operators[Math.floor((Math.random() * 3))]
    var secondOperator = operators[Math.floor((Math.random() * 3))]

    var expression = firstTerm.toString() + firstOperator + secondTerm.toString() + secondOperator + thirdTerm.toString()
    var answer = eval(expression).toString()

    const captcha = {
      captchaId: captchaId,
      captcha: expression,
      answer: answer
    }
    const captchaInstance = models.Captcha.build(captcha)
    captchaInstance.save().then(() => {
      res.json(captcha)
    })
  }
}
