/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'
import * as utils from '../lib/utils'

const ALLOWED_REDIRECT_URLS = new Set([
  'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
  'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
  'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6'
])

export function performRedirect () {
  return ({ query }: Request, res: Response, next: NextFunction) => {
    const requestedUrl = typeof query.to === 'string' ? query.to : ''

    if (ALLOWED_REDIRECT_URLS.has(requestedUrl)) {
      challengeUtils.solveIf(challenges.redirectCryptoCurrencyChallenge, () => {
        return requestedUrl === 'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW' ||
          requestedUrl === 'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm' ||
          requestedUrl === 'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6'
      })
      challengeUtils.solveIf(challenges.redirectChallenge, () => {
        return isUnintendedRedirect(requestedUrl)
      })

      return res.redirect(requestedUrl)
    }

    res.status(406)
    next(new Error('Unrecognized target URL for redirect: ' + requestedUrl))
  }
}
function isUnintendedRedirect (toUrl: string) {
  let unintended = true
  for (const allowedUrl of security.redirectAllowlist) {
    unintended = unintended && !utils.startsWith(toUrl, allowedUrl)
  }
  return unintended
}
