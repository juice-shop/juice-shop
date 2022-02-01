/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { Request, Response, NextFunction } from 'express'
import models = require('../models/index')
import { Memory, SecurityAnswer, User } from '../data/types'

const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const users = require('../data/datacache').users
const security = require('../lib/insecurity')

module.exports = function resetPassword () {
  return ({ body, connection }: Request, res: Response, next: NextFunction) => {
    const email = body.email
    const answer = body.answer
    const newPassword = body.new
    const repeatPassword = body.repeat
    if (!email || !answer) {
      next(new Error('Blocked illegal activity by ' + connection.remoteAddress))
    } else if (!newPassword || newPassword === 'undefined') {
      res.status(401).send(res.__('Password cannot be empty.'))
    } else if (newPassword !== repeatPassword) {
      res.status(401).send(res.__('New and repeated password do not match.'))
    } else {
      models.SecurityAnswer.findOne({
        include: [{
          model: models.User,
          where: { email }
        }]
      }).then((data: SecurityAnswer) => {
        if (security.hmac(answer) === data.answer) {
          models.User.findByPk(data.UserId).then((user: User) => {
            user.update({ password: newPassword }).then((user: User) => {
              verifySecurityAnswerChallenges(user, answer)
              res.json({ user })
            }).catch((error: Error) => {
              next(error)
            })
          }).catch((error: Error) => {
            next(error)
          })
        } else {
          res.status(401).send(res.__('Wrong answer to security question.'))
        }
      }).catch((error: Error) => {
        next(error)
      })
    }
  }
}

function verifySecurityAnswerChallenges (user: User, answer: string) {
  utils.solveIf(challenges.resetPasswordJimChallenge, () => { return user.id === users.jim.id && answer === 'Samuel' })
  utils.solveIf(challenges.resetPasswordBenderChallenge, () => { return user.id === users.bender.id && answer === 'Stop\'n\'Drop' })
  utils.solveIf(challenges.resetPasswordBjoernChallenge, () => { return user.id === users.bjoern.id && answer === 'West-2082' })
  utils.solveIf(challenges.resetPasswordMortyChallenge, () => { return user.id === users.morty.id && answer === '5N0wb41L' })
  utils.solveIf(challenges.resetPasswordBjoernOwaspChallenge, () => { return user.id === users.bjoernOwasp.id && answer === 'Zaya' })
  utils.solveIf(challenges.resetPasswordUvoginChallenge, () => { return user.id === users.uvogin.id && answer === 'Silence of the Lambs' })
  utils.solveIf(challenges.geoStalkingMetaChallenge, () => {
    const securityAnswer = ((() => {
      const memories: Memory[] = config.get('memories')
      for (let i = 0; i < memories.length; i++) {
        if (memories[i].geoStalkingMetaSecurityAnswer) {
          return memories[i].geoStalkingMetaSecurityAnswer
        }
      }
    })())
    return user.id === users.john.id && answer === securityAnswer
  })
  utils.solveIf(challenges.geoStalkingVisualChallenge, () => {
    const securityAnswer = ((() => {
      const memories: Memory[] = config.get('memories')
      for (let i = 0; i < memories.length; i++) {
        if (memories[i].geoStalkingVisualSecurityAnswer) {
          return memories[i].geoStalkingVisualSecurityAnswer
        }
      }
    })())
    return user.id === users.emma.id && answer === securityAnswer
  })
}
