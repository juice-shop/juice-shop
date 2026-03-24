/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as challengeUtils from '../lib/challengeUtils'
import { type Request, type Response } from 'express'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'

// fields= раньше шёл в user.data[field] — можно было дернуть чужие ключи
// добавили whitelist с колонками User из models/user.ts
const user_profile_field_allowlist = new Set([
  'id',
  'username',
  'email',
  'lastLoginIp',
  'profileImage',
  'role',
  'deluxeToken',
  'isActive'
])

export function retrieveLoggedInUser () {
  return (req: Request, res: Response) => {
    let user
    let response: any
    const emptyUser = { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined }
    try {
      if (security.verify(req.cookies.token)) {
        user = security.authenticatedUsers.get(req.cookies.token)

        // Parse the fields parameter into an array, splitting by comma.
        // If not provided, both these variables will be undefined.
        const fieldsParam = req.query?.fields as string | undefined
        const requestedFields = fieldsParam ? fieldsParam.split(',').map(f => f.trim()) : []

        let baseUser: any = {}

        if (requestedFields.length > 0) {
          for (const field of requestedFields) {
            if (!user_profile_field_allowlist.has(field)) {
              continue
            }
            // без user.data[field] — semgrep remote-property-injection
            if (field === 'id' && user?.data.id !== undefined) {
              baseUser.id = user.data.id
            } else if (field === 'username' && user?.data.username !== undefined) {
              baseUser.username = user.data.username
            } else if (field === 'email' && user?.data.email !== undefined) {
              baseUser.email = user.data.email
            } else if (field === 'lastLoginIp' && user?.data.lastLoginIp !== undefined) {
              baseUser.lastLoginIp = user.data.lastLoginIp
            } else if (field === 'profileImage' && user?.data.profileImage !== undefined) {
              baseUser.profileImage = user.data.profileImage
            } else if (field === 'role' && user?.data.role !== undefined) {
              baseUser.role = user.data.role
            } else if (field === 'deluxeToken' && user?.data.deluxeToken !== undefined) {
              baseUser.deluxeToken = user.data.deluxeToken
            } else if (field === 'isActive' && user?.data.isActive !== undefined) {
              baseUser.isActive = user.data.isActive
            }
          }
        } else {
          // If no fields parameter, return standard fields (not password field)
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
    // Solve passwordHashLeakChallenge when password field is included in response
    challengeUtils.solveIf(challenges.passwordHashLeakChallenge, () => response?.user?.password)

    if (req.query.callback === undefined) {
      res.json(response)
    } else {
      challengeUtils.solveIf(challenges.emailLeakChallenge, () => { return true })
      res.jsonp(response)
    }
  }
}
