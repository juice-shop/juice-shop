const models = require('../models/index')
const fs = require('fs')
const text2png = require('text2png')

function captchas () {
  return (req, res) => {
    var captchaId = req.app.locals.captchaId++
    var operators = ['*', '+', '-']

    var firstTerm = Math.floor((Math.random() * 10) + 1)
    var secondTerm = Math.floor((Math.random() * 10) + 1)
    var thirdTerm = Math.floor((Math.random() * 10) + 1)

    var firstOperator = operators[Math.floor((Math.random() * 3))]
    var secondOperator = operators[Math.floor((Math.random() * 3))]

    var expression = firstTerm.toString() + firstOperator + secondTerm.toString() + secondOperator + thirdTerm.toString()
    var answer = eval(expression).toString() // eslint-disable-line no-eval
    fs.writeFileSync('./frontend/src/assets/public/images/captcha.png', text2png(expression, {color: 'blue'}))
    
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

captchas.verifyCaptcha = () => (req, res, next) => {
  models.Captcha.findOne({ where: { captchaId: req.body.captchaId } }).then(captcha => {
    if (req.body.captcha === captcha.dataValues.answer) {
      next()
    } else {
      res.status(401).send('Wrong answer to CAPTCHA. Please try again.')
    }
  })
}

module.exports = captchas
