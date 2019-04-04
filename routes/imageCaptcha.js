const svgCaptcha = require('svg-captcha')
const models = require('../models/index')

function imageCaptchas () {
  return (req, res) => {
    let captchaId = Math.floor(Math.random() * 9999)
    let captcha = svgCaptcha.create({ size: 5, noise: 2, color: true })

    const imageCaptcha = {
      captchaId: captchaId,
      image: captcha.data,
      answer: captcha.text
    }
    const imageCaptchaInstance = models.ImageCaptcha.build(imageCaptcha)
    imageCaptchaInstance.save().then(() => {
      res.json(imageCaptcha)
    })
  }
}

imageCaptchas.verifyCaptcha = () => (req, res, next) => {
  models.ImageCaptcha.findOne({ where: { captchaId: req.body.captchaId } }).then(imageCaptcha => {
    if (!imageCaptcha) {
      next()
    } else {
      if (req.body.answer === imageCaptcha.dataValues.answer) {
        next()
      } else {
        res.status(401).send('Wrong answer to CAPTCHA. Please try again.')
      }
    }
  })
}

module.exports = imageCaptchas
