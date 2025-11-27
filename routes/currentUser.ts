/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as challengeUtils from '../lib/challengeUtils'
import { type Request, type Response } from 'express'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'

export function retrieveLoggedInUser () {
  return (req: Request, res: Response) => {
    let user
    try {
      if (security.verify(req.cookies.token)) {
        user = security.authenticatedUsers.get(req.cookies.token)
      }
    } catch (err) {
      user = undefined
    } finally {
      const responseUser: any = {}
      if (user?.data) {
        responseUser.id = user.data.id
        responseUser.email = user.data.email
        responseUser.lastLoginIp = user.data.lastLoginIp
        responseUser.profileImage = user.data.profileImage
      } else {
        responseUser.id = undefined
        responseUser.email = undefined
        responseUser.lastLoginIp = undefined
        responseUser.profileImage = undefined
      }
      const response = { user: responseUser }
      if (req.query.callback === undefined) {
        res.json(response)
      } else {
        challengeUtils.solveIf(challenges.emailLeakChallenge, () => { return true })
        res.jsonp(response)
      }
    }
  }
}
