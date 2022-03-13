/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'
import { SecurityAnswerModel } from '../models/securityAnswer'
import { UserModel } from '../models/user'
import { SecurityQuestionModel } from '../models/securityQuestion'

module.exports = function securityQuestion () {
  return ({ query }: Request, res: Response, next: NextFunction) => {
    const email = query.email
    SecurityAnswerModel.findOne({
      include: [{
        model: UserModel,
        where: { email: email?.toString() }
      }]
    }).then((answer: SecurityAnswerModel | null) => {
      if (answer) {
        SecurityQuestionModel.findByPk(answer.SecurityQuestionModelId).then((question: SecurityQuestionModel | null) => {
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
