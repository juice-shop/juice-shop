/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'
import { ImageCaptchaModel } from '../models/imageCaptcha'
import { Op } from 'sequelize'

const svgCaptcha = require('svg-captcha')
const security = require('../lib/insecurity')
const crypto = require('node:crypto')
const aesKey = "EA99A61D92D2955B1E9285B55BF2AD4200000000000000000000000000000000"
  
function aesEncrypt(plaintext: String) {
  const iv  = crypto.randomBytes(16).toString("hex")
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(aesKey, "hex"), Buffer.from(iv, "hex"))
  const ciphertext = cipher.update(plaintext, "utf8", "hex") +
                     cipher.final("hex")
  return iv + ":" + ciphertext
}

function imageCaptchas () {
  return (req: Request, res: Response) => {
    const captcha = svgCaptcha.create({ size: 5, noise: 2, color: true })
    
    const imageCaptcha = {
      image: captcha.data,
      verifier: aesEncrypt(captcha.text),
      UserId: security.authenticatedUsers.from(req).data.id
    }
    const imageCaptchaInstance = ImageCaptchaModel.build(imageCaptcha)
    imageCaptchaInstance.save().then(() => {
      res.json(imageCaptcha)
    }).catch(() => {
      res.status(400).send(res.__('Unable to create CAPTCHA. Please try again.'))
    })
  }
}

function aesDecrypt(payload: String) {
  const [iv,msg] = payload.split(":")
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(aesKey, "hex"), Buffer.from(iv, "hex"))
  return decipher.update(msg, "hex", "utf8") +
         decipher.final("utf-8")
}

imageCaptchas.verifyCaptcha = () => (req: Request, res: Response, next: NextFunction) => {
  const user = security.authenticatedUsers.from(req)
  const UserId = user ? user.data ? user.data.id : undefined : undefined
  ImageCaptchaModel.findAll({
    limit: 1,
    where: {
      UserId: UserId,
      createdAt: {
        [Op.gt]: new Date(Date.now() - 300000)
      }
    },
    order: [['createdAt', 'DESC']]
  }).then(captchas => {
    if (!captchas[0] || req.body.answer === aesDecrypt(req.body.verifier)) {
      next()
    } else {
      res.status(401).send(res.__('Wrong answer to CAPTCHA. Please try again.'))
    }
  }).catch(() => {
    res.status(401).send(res.__('Something went wrong while submitting CAPTCHA. Please try again.'))
  })
}

module.exports = imageCaptchas
