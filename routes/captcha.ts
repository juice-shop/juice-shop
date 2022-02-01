/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import { Request, Response, NextFunction } from 'express'
import { Captcha } from '../data/types'

function captchas () {
  return (req: Request, res: Response) => {
    const captchaId = req.app.locals.captchaId++
    const operators = ['*', '+', '-']

    const firstTerm = Math.floor((Math.random() * 10) + 1)
    const secondTerm = Math.floor((Math.random() * 10) + 1)
    const thirdTerm = Math.floor((Math.random() * 10) + 1)

    const firstOperator = operators[Math.floor((Math.random() * 3))]
    const secondOperator = operators[Math.floor((Math.random() * 3))]

    const expression = firstTerm.toString() + firstOperator + secondTerm.toString() + secondOperator + thirdTerm.toString()
    const answer = eval(expression).toString() // eslint-disable-line no-eval

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

captchas.verifyCaptcha = () => (req: Request, res: Response, next: NextFunction) => {
  models.Captcha.findOne({ where: { captchaId: req.body.captchaId } }).then((captcha: Captcha) => {
    if (captcha && req.body.captcha === captcha.dataValues.answer) {
      next()
    } else {
      res.status(401).send(res.__('Wrong answer to CAPTCHA. Please try again.'))
    }
  }).catch((error: Error) => {
    next(error)
  })
}

module.exports = captchas
