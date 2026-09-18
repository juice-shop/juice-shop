/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'

export function performRedirect () {
  return ({ query }: Request, res: Response, next: NextFunction) => {
    const toUrl = query.to as string | undefined
    const safeUrl = security.getAllowedRedirect(toUrl)

    if (!safeUrl) {
      res.status(406)
      return next(new Error('Unrecognized target URL for redirect: ' + toUrl))
    }

    res.redirect(safeUrl)
  }
}

function isUnintendedRedirect (toUrl: string) {
  let unintended = true
  for (const allowedUrl of security.redirectAllowlist) {
    unintended = unintended && !toUrl.startsWith(allowedUrl)
  }
  return unintended
}
