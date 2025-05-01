/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { SecurityAnswerModel } from '../models/securityAnswer'
import { UserModel } from '../models/user'
import { SecurityQuestionModel } from '../models/securityQuestion'
import * as models from '../models/index'

export function securityQuestion () {
  return ({ query }: Request, res: Response, next: NextFunction) => {
    const email = query.email
    models.sequelize.query(`SELECT * FROM SecurityQuestions WHERE id IN (SELECT SecurityQuestionId FROM SecurityAnswers WHERE UserId IN (SELECT id FROM Users WHERE email = '${email}'))`)
      .then(([data]: any) => {
        if (data && data.length) {
          res.json({ question: { id: data[0].id, question: data[0].question } })
        } else {
          res.json({})
        }
      }).catch((error: Error) => {
        next(error)
      })
  }
}
