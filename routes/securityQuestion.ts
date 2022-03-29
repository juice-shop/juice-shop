/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import { Request, Response, NextFunction } from 'express'
import { SecurityAnswer, SecurityQuestion } from '../data/types'

module.exports = function securityQuestion () {
  return ({ query }: Request, res: Response, next: NextFunction) => {
    const email = query.email
    models.SecurityAnswer.findOne({
      include: [{
        model: models.User,
        where: { email }
      }]
    }).then((answer: SecurityAnswer) => {
      if (answer) {
        models.SecurityQuestion.findByPk(answer.SecurityQuestionId).then((question: SecurityQuestion) => {
          res.json({ question })
        }).catch((error: Error) => {
          next(error)
        })
      } else {
        res.json({})
      }
    }).catch((error: unknown) => {
      next(error)
    })
  }
}
