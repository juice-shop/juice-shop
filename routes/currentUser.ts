/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as challengeUtils from '../lib/challengeUtils'
import { type Request, type Response } from 'express'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'

export function retrieveLoggedInUser () {
  return (req: Request, res: Response) => {
    let user
    let response: any

    try {
      if (security.verify(req.cookies.token)) {
        // Token valid: retrieve authenticated user and build detailed response
        user = security.authenticatedUsers.get(req.cookies.token)

        // Check for explicit URL parameter ?showSensitive (present vs not present matters)
        const hasShowSensitive = req.query && typeof req.query.showSensitive !== 'undefined'
        const rawShowSensitive = hasShowSensitive ? req.query.showSensitive : undefined
        const showHash = hasShowSensitive && (String(rawShowSensitive) === 'true' || String(rawShowSensitive) === '1')

        const baseUser = {
          id: user?.data ? user.data.id : undefined,
          email: user?.data ? user.data.email : undefined,
          lastLoginIp: user?.data ? user.data.lastLoginIp : undefined,
          profileImage: user?.data ? user.data.profileImage : undefined
        }

        response = { user: baseUser }

        // Include passwordHash only when verification succeeded and a user exists.
        // Behavior:
        // - If `showSensitive` is NOT provided -> do not add `passwordHash` field.
        // - If `showSensitive` is provided and evaluates to false (e.g. 'false' or '0') -> return masked stars.
        // - If `showSensitive` is provided and evaluates to true (e.g. 'true' or '1') -> return stored hash.
        if (user?.data != null) {
          const stored = (user as any).data.password
          if (hasShowSensitive) {
            response.user.passwordHash = showHash ? stored : (stored ? String(stored).replace(/./g, '*') : undefined)
          }
        }
      } else {
        // Token not present or not valid: return empty user fields (no passwordHash)
        response = { user: { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined } }
      }
    } catch (err) {
      // Verification error: respond with empty user fields
      response = { user: { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined } }
    }

    if (req.query.callback === undefined) {
      res.json(response)
    } else {
      challengeUtils.solveIf(challenges.emailLeakChallenge, () => { return true })
      res.jsonp(response)
    }
  }
}
