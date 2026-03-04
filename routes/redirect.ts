/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'
import * as utils from '../lib/utils'

export function performRedirect () {
  return ({ query }: Request, res: Response, next: NextFunction) => {
    const raw = String(query.to || '')

    if (!raw.startsWith('/')) {
      res.status(406)
      return next(new Error('Only internal redirects are allowed!'))
    }

    if (raw.startsWith('//') || raw.includes('\\')) {
      res.status(406)
      return next(new Error('Invalid redirect target!'))
    }

    return res.redirect(raw)
  }
}
function isUnintendedRedirect (toUrl: string) {
  let unintended = true
  for (const allowedUrl of security.redirectAllowlist) {
    unintended = unintended && !utils.startsWith(toUrl, allowedUrl)
  }
  return unintended
}
