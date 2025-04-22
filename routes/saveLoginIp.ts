/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'
import { UserModel } from '../models/user'
import * as utils from '../lib/utils'

export function saveLoginIp () {
  return (req: Request, res: Response, next: NextFunction) => {
    const loggedInUser = security.authenticatedUsers.from(req)
    if (loggedInUser !== undefined) {
      let lastLoginIp = req.headers['true-client-ip']
      if (Array.isArray(lastLoginIp)) {
        lastLoginIp = lastLoginIp[0]
      }
      if (utils.isChallengeEnabled(challenges.httpHeaderXssChallenge)) {
        challengeUtils.solveIf(challenges.httpHeaderXssChallenge, () => { return lastLoginIp === '<iframe src="javascript:alert(`xss`)">' })
      } else {
        lastLoginIp = security.sanitizeSecure(lastLoginIp ?? '')
      }
      if (lastLoginIp === undefined) {
        lastLoginIp = utils.toSimpleIpAddress(req.socket.remoteAddress ?? '')
      }
      UserModel.findByPk(loggedInUser.data.id).then((user: UserModel | null) => {
        user?.update({ lastLoginIp: lastLoginIp?.toString() }).then((user: UserModel) => {
          res.json(user)
        }).catch((error: Error) => {
          next(error)
        })
      }).catch((error: Error) => {
        next(error)
      })
    } else {
      res.sendStatus(401)
    }
  }
}
