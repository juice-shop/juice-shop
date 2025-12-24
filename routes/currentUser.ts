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
        // Retrieve the authenticated user from the token
        user = security.authenticatedUsers.get(req.cookies.token)
        // Check if the showSensitive query parameter is present
        const hasShowSensitive = typeof req.query?.showSensitive !== 'undefined'
        // Get the raw value of showSensitive from the query
        const rawShowSensitive = req.query?.showSensitive
        // Determine if the password hash should be shown (true/1)
        const showHash = hasShowSensitive && (String(rawShowSensitive) === 'true' || String(rawShowSensitive) === '1')
        // Build the base user object with non-sensitive fields
        const baseUser = {
          id: user?.data?.id,
          email: user?.data?.email,
          lastLoginIp: user?.data?.lastLoginIp,
          profileImage: user?.data?.profileImage
        }
        // Prepare the response object
        response = { user: baseUser }
        // If user data exists, handle password hash exposure
        if (user?.data != null) {
          // Get the stored password hash
          const stored = (user as any).data.password
          if (hasShowSensitive) {
            // Show the real hash if requested, otherwise mask it with asterisks
            response.user.passwordHash = showHash ? stored : (stored ? String(stored).replace(/./g, '*') : undefined)
          }
        }
      } else {
        response = { user: { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined } }
      }
    } catch (err) {
      response = { user: { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined } }
    }
    // Solve passwordHashLeakChallenge if showSensitive=true or showSensitive=1 causing passwordHash to be returned
    if (response?.user?.passwordHash && (req.query?.showSensitive === 'true' || req.query?.showSensitive === '1')) {
      challengeUtils.solveIf(challenges.passwordHashLeakChallenge, () => true)
    }
    if (req.query.callback === undefined) {
      res.json(response)
    } else {
      challengeUtils.solveIf(challenges.emailLeakChallenge, () => { return true })
      res.jsonp(response)
    }
  }
}
