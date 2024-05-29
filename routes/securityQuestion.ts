/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { SecurityAnswerModel } from '../models/securityAnswer'
import { UserModel } from '../models/user'
import { SecurityQuestionModel } from '../models/securityQuestion'
//const orm = require('typeorm')
import {sanitizeInput} from '../lib/utils'
const pdf = require('html-pdf-node')

// module.exports = function securityQuestion () {
//   return ({ query }: Request, res: Response, next: NextFunction) => {
//     const email = sanitizeInput(query.email)
//     SecurityAnswerModel.findOne({
//       include: [{
//         model: sanitizeInput(UserModel),
//         where: { email: email?.toString() }
//       }]
//     }).then((answer: SecurityAnswerModel | null) => {
//       if (answer != null) {
//         SecurityQuestionModel.findByPk(answer.SecurityQuestionId).then((question: SecurityQuestionModel | null) => {
//           res.json({ question })
//         }).catch((error: Error) => {
//           next(error)
//         })
//       } else {
//         res.json({})
//       }
//     }).catch((error: unknown) => {
//       next(error)
//     })
//   }
// }
