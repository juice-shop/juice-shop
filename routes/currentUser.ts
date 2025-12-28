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
    const emptyUser = { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined }
    try {
      if (security.verify(req.cookies.token)) {
        // Retrieve the authenticated user from the token
        user = security.authenticatedUsers.get(req.cookies.token)

        // Parse the fields parameter if provided
        const fieldsParam = req.query?.fields as string | undefined
        const requestedFields = fieldsParam ? fieldsParam.split(',').map(f => f.trim()) : []

        // If fields parameter is provided, only return those fields
        // Vulnerable: passwordHash is not in the allowlist, so it can be tricked into being returned
        let baseUser: any = {}

        if (requestedFields.length > 0) {
          // When fields are specified, return only those fields
          for (const field of requestedFields) {
            if (field === 'id') {
              baseUser.id = user?.data?.id
            } else if (field === 'email') {
              baseUser.email = user?.data?.email
            } else if (field === 'lastLoginIp') {
              baseUser.lastLoginIp = user?.data?.lastLoginIp
            } else if (field === 'profileImage') {
              baseUser.profileImage = user?.data?.profileImage
            } else if (field === 'password') {
              // Vulnerable: no validation prevents returning password
              if (user?.data != null) {
                baseUser.password = (user as any).data.password
              }
            }
          }
        } else {
          // If no fields parameter, return standard fields
          baseUser = {
            id: user?.data?.id,
            email: user?.data?.email,
            lastLoginIp: user?.data?.lastLoginIp,
            profileImage: user?.data?.profileImage
          }
        }

        response = { user: baseUser }
      } else {
        response = { user: emptyUser }
      }
    } catch (err) {
      response = { user: emptyUser }
    }
    // Solve passwordHashLeakChallenge when password is included in response
    if (response?.user?.password) {
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
