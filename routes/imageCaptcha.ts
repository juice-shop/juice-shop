/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import svgCaptcha from 'svg-captcha'
import { Op } from 'sequelize'

import { ImageCaptchaModel } from '../models/imageCaptcha'
import * as security from '../lib/insecurity'

export function imageCaptchas () {
  return (req: Request, res: Response) => {
    const captcha = svgCaptcha.create({ size: 5, noise: 2, color: true })

    const user = security.authenticatedUsers.from(req)
    if (!user) {
      res.status(401).send(res.__('You need to be logged in to request a CAPTCHA.'))
      return
    }

    const imageCaptcha = {
      image: captcha.data,
      answer: captcha.text,
      UserId: user.data.id
    }
    const imageCaptchaInstance = ImageCaptchaModel.build(imageCaptcha)
    imageCaptchaInstance.save().then(() => {
      res.json(imageCaptcha)
    }).catch(() => {
      res.status(400).send(res.__('Unable to create CAPTCHA. Please try again.'))
    })
  }
}

export const verifyImageCaptcha = () => (req: Request, res: Response, next: NextFunction) => {
  const user = security.authenticatedUsers.from(req)
  const UserId = user ? user.data ? user.data.id : undefined : undefined
  ImageCaptchaModel.findAll({
    limit: 1,
    where: {
      UserId,
      createdAt: {
        [Op.gt]: new Date(Date.now() - 300000)
      }
    },
    order: [['createdAt', 'DESC']]
  }).then(captchas => {
    if (!captchas[0] || req.body.answer === captchas[0].answer) {
      next()
    } else {
      res.status(401).send(res.__('Wrong answer to CAPTCHA. Please try again.'))
    }
  }).catch(() => {
    res.status(401).send(res.__('Something went wrong while submitting CAPTCHA. Please try again.'))
  })
}
