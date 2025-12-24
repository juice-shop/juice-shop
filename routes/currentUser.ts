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
    // Reusable empty user object to avoid duplication for unauthenticated / error responses
    const emptyUser = { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined, passwordHash: undefined }
    // Compute showHash in outer scope so it can be referenced after the try/catch (challenge check)
    let showHash = false
    try {
      if (security.verify(req.cookies.token)) {
        // Retrieve the authenticated user from the token
        user = security.authenticatedUsers.get(req.cookies.token)
        // Determine if the password hash should be shown — only when the query value is exactly 'true'
        showHash = req.query?.showSensitive === 'true'
        // Build the base user object with non-sensitive fields
        // Always include a passwordHash field (may be masked or real depending on query)
        const baseUser = {
          id: user?.data?.id,
          email: user?.data?.email,
          lastLoginIp: user?.data?.lastLoginIp,
          profileImage: user?.data?.profileImage,
          passwordHash: undefined
        }
        // Prepare the response object
        response = { user: baseUser }
        // If user data exists, handle password hash exposure
        if (user?.data != null) {
          // Get the stored password hash
          const stored = (user as any).data.password
          // Always return the passwordHash field.
          // If showSensitive is explicitly requested (true or '1'), return the real hash.
          // Otherwise, return a masked version (asterisks) when a stored hash exists.
          response.user.passwordHash = showHash ? stored : (stored ? String(stored).replace(/./g, '*') : undefined)
        }
      } else {
        response = { user: emptyUser }
      }
    } catch (err) {
      response = { user: emptyUser }
    }
    // Solve passwordHashLeakChallenge only when showSensitive is exactly 'true' causing real passwordHash to be returned
    if (response?.user?.passwordHash && showHash) {
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
