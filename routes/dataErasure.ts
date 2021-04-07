/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */
import express, { Request, Response, NextFunction } from 'express'
import insecurity from '../lib/insecurity'

const models = require('../models/index')

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
  layout: string
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
    const filePath: string = req.body.layout
    if (filePath !== undefined) {
      const conditions: boolean = (filePath.toLowerCase().includes('ftp') || filePath.toLocaleLowerCase().includes('ctf.key') || filePath.toLocaleLowerCase().includes('encryptionkeys'))
      if (!conditions) {
        res.render('dataErasureResult', {
          ...req.body
        }, (error, html) => {
          if (!html || error) {
            next(new Error('No Such file exist'))
          } else {
            const sendlfrResponse: string = html.slice(0, 100) + '......'
            res.send(sendlfrResponse)
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
