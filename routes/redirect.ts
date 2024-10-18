/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import utils = require('../lib/utils')
import challengeUtils = require('../lib/challengeUtils')
import { type Request, type Response, type NextFunction } from 'express'
import { challenges } from '../data/datacache'

const security = require('../lib/insecurity')

module.exports = function performRedirect () {
  return ({ query }: Request, res: Response, next: NextFunction) => {
    const to: string = query.to as string
    const allowedRedirectUrlMap = {
      github: 'https://github.com/juice-shop/juice-shop',
      blockchain: 'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm', // vuln-code-snippet vuln-line redirectCryptoCurrencyChallenge
      explorer: 'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW', // vuln-code-snippet vuln-line redirectCryptoCurrencyChallenge
      etherscan: 'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6', // vuln-code-snippet vuln-line redirectCryptoCurrencyChallenge
      spreadshirt: 'http://shop.spreadshirt.com/juiceshop',
      spreadshirtDe: 'http://shop.spreadshirt.de/juiceshop',
      stickeryou: 'https://www.stickeryou.com/products/owasp-juice-shop/794',
      leanpub: 'http://leanpub.com/juice-shop'
    }
    if (allowedRedirectUrlMap[to]) {
      res.redirect(allowedRedirectUrlMap[to]);
    } else {
      res.status(406)
      next(new Error('Unrecognized target URL map key for redirect: ' + to));
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
