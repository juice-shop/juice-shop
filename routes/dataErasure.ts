/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
import express, { Request, Response, NextFunction } from 'express'
import insecurity from '../lib/insecurity'
import path from 'path'

const challenges = require('../data/datacache').challenges
const models = require('../models/index')
const utils = require('../lib/utils')
const router = express.Router()

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/', async (req, res, next): Promise<void> => {
  const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
  if (!loggedInUser) {
    next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    return
  }
  const email = loggedInUser.data.email

  try {
    const answer = await models.SecurityAnswer.findOne({
      include: [{
        model: models.User,
        where: { email }
      }]
    })
    const question = await models.SecurityQuestion.findByPk(answer.SecurityQuestionId)

    res.render('dataErasureForm', { userEmail: email, securityQuestion: question.dataValues.question })
  } catch (error) {
    next(error)
  }
})

interface DataErasureRequestParams {
  layout?: string
  email: string
  securityAnswer: string
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/', async (req: Request<{}, {}, DataErasureRequestParams>, res: Response, next: NextFunction): Promise<void> => {
  const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
  if (!loggedInUser) {
    next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    return
  }

  try {
    await models.PrivacyRequest.create({
      UserId: loggedInUser.data.id,
      deletionRequested: true
    })

    res.clearCookie('token')
    if (req.body.layout !== undefined) {
      const filePath: string = path.resolve(req.body.layout).toLowerCase()
      const isForbiddenFile: boolean = (filePath.includes('ftp') || filePath.includes('ctf.key') || filePath.includes('encryptionkeys'))
      if (!isForbiddenFile) {
        res.render('dataErasureResult', {
          ...req.body
        }, (error, html) => {
          if (!html || error) {
            next(new Error(error))
          } else {
            const sendlfrResponse: string = html.slice(0, 100) + '......'
            res.send(sendlfrResponse)
            utils.solve(challenges.lfrChallenge)
          }
        })
      } else {
        next(new Error('File access not allowed'))
      }
    } else {
      res.render('dataErasureResult', {
        ...req.body
      })
    }
  } catch (error) {
    next(error)
  }
})

export default router
