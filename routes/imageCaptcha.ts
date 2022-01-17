/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import { Request, Response, NextFunction } from 'express'

const svgCaptcha = require('svg-captcha')
const Op = models.Sequelize.Op
const security = require('../lib/insecurity')

function imageCaptchas () {
  return (req: Request, res: Response) => {
    const captcha = svgCaptcha.create({ size: 5, noise: 2, color: true })

    const imageCaptcha = {
      image: captcha.data,
      answer: captcha.text,
      UserId: security.authenticatedUsers.from(req).data.id
    }
    const imageCaptchaInstance = models.ImageCaptcha.build(imageCaptcha)
    imageCaptchaInstance.save().then(() => {
      res.json(imageCaptcha)
    })
  }
}

imageCaptchas.verifyCaptcha = () => (req: Request, res: Response, next: NextFunction) => {
  const user = security.authenticatedUsers.from(req)
  const UserId = user ? user.data ? user.data.id : undefined : undefined
  models.ImageCaptcha.findAll({
    limit: 1,
    where: {
      UserId: UserId,
      createdAt: {
        [Op.gt]: new Date(new Date() - 300000)
      }
    },
    order: [['createdAt', 'DESC']]
  }).then(captchas => {
    if (!captchas[0] || req.body.answer === captchas[0].dataValues.answer) {
      next()
    } else {
      res.status(401).send(res.__('Wrong answer to CAPTCHA. Please try again.'))
    }
  })
}

module.exports = imageCaptchas
