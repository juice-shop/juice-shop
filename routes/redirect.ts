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
    const toUrl: string = query.to as string

    const allowedHosts = ['github.com', 'blockchain.info', 'explorer.dash.org', 'etherscan.io']

    let parsedUrl: URL
    try {
      parsedUrl = new URL(toUrl)
    } catch {
      res.status(406)
      next(new Error('Invalid URL for redirect: ' + toUrl))
      return
    }

    if (!allowedHosts.includes(parsedUrl.hostname)) {
      res.status(406)
      next(new Error('Unrecognized target URL for redirect: ' + toUrl))
      return
    }

    if (security.isRedirectAllowed(toUrl)) {
      res.redirect(toUrl)
    } else {
      res.status(406)
      next(new Error('Unrecognized target URL for redirect: ' + toUrl))
    }
  }
}

function isUnintendedRedirect (toUrl: string) {
  let unintended = true
  for (const allowedUrl of security.redirectAllowlist) {
    unintended = unintended && !utils.startsWith(toUrl, allowedUrl)
  }
  return unintended
}
