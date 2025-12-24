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
    // Note: do not include `passwordHash` here — omit the field entirely when no showSensitive is provided
    const emptyUser = { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined }
    // Compute showHash and hasShowSensitive in outer scope so they can be referenced after the try/catch (challenge check)
    let showHash = false
    let hasShowSensitive = false
    try {
      if (security.verify(req.cookies.token)) {
        // Retrieve the authenticated user from the token
        user = security.authenticatedUsers.get(req.cookies.token)
        // Determine whether the showSensitive parameter is present and whether it equals the literal string 'true'
        hasShowSensitive = typeof req.query?.showSensitive !== 'undefined'
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
          // Only include the passwordHash field if the showSensitive parameter was provided.
          // - If showSensitive is exactly the string 'true', include the real hash.
          // - If showSensitive is provided but not 'true', include a masked value (asterisks) if a hash exists.
          // - If showSensitive is not provided, omit the passwordHash field entirely.
          if (hasShowSensitive) {
            response.user.passwordHash = showHash ? stored : (stored ? String(stored).replace(/./g, '*') : undefined)
          }
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
