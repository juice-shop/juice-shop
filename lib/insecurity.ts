/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'node:fs'
import crypto from 'node:crypto'
import { type Request, type Response, type NextFunction } from 'express'
import { type UserModel } from 'models/user'
import expressJwt from 'express-jwt'
import jwt from 'jsonwebtoken'
import jws from 'jws'
import sanitizeHtmlLib from 'sanitize-html'
import sanitizeFilenameLib from 'sanitize-filename'
import * as utils from './utils'

/* jslint node: true */
// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-expect-error FIXME no typescript definitions for z85 :(
import * as z85 from 'z85'

export const publicKey = fs ? fs.readFileSync('encryptionkeys/jwt.pub', 'utf8') : 'placeholder-public-key'
const privateKey = '-----BEGIN PRIVATE KEY-----\r\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCx+cRp5Zny1Xdx\r\nCF5LFsDhBM8fpqmPlI4vO+x4X/oqU0pkP38ttNc5Xm7mpIQVPIXRffn/Om+/fB0S\r\n9tr+G5jcZzAoo7hPIAftDKiLx9jXhrhQrK3mhI+SNSGNI7z5glS5YcAj82XokcLe\r\nvGMQ+Cd7S6gUl2fzmYxjthOmy5REYLlPAL5dJXPLRwtI7eYTQKzPodmxi5dd/u1a\r\nzH4TO5LathTx85DFnohxw5B04/vT8Mv6TzIUYfoeRYwdbhx2PsG+0+SRDDyK3pdM\r\nqbaa8Id2kF0dTiiMM+ad073bmfgunve7NBSd2rkQBU/AqaH9cy43GqGKxZR+UEff\r\nGS7kCG03AgMBAAECggEAI2IyZBFjVY2OJRlSUeBwsWv41+SVIngY+pgRz+7Y+DA+\r\nAodDPC2PepblOpKrteMmAbvnh5AxJmNBDoOoj0uiTPNw9itymbyXBtB08/FkEZl1\r\nrIhgPIvPVXSduodH6103hfHCtwMNmDregNT4ZyfHBbLJdGqTnrFA4ZQR/R/NVviF\r\nBJgRahYUM3aGWcfAuGUN6mZdMKUYX+kRrLi0B5HjjX0kjNvgRbvNUrmsA2afy7yx\r\nnQDq6QK5E94GhUN14OIteMtKVDA9FJWodZH7PvSaqeheSZbiytC2JQp2Un/naPVV\r\nczYl9arUByMNq1NAdN4IdiYo3kree6+gE8KQUcKJvQKBgQDcM2u4kpc9WSSfQx8T\r\nSQRGQcFviPbRkUHW7C895qTMMXjr7EvHWoBNRA3I5+Q7er9ug5FxQVG0YKeAd9SW\r\nLZFl6ustHS8sy+H0wliJxqMlwTw5pKmH3IKJIqaexgwK/0d7uGS3ByXwgapLU6Sq\r\n+Ui69p73bQgCNO0/mybRAXUMawKBgQDO6PfIH7L1RgVY1Kg3Ml+QXY6wLs3KOu8Z\r\nZyuQY/U13BpfiN/KQFVuKfKYJjMOudSSZBNFiVKzG6O3UCv500zzPlXqjoYvDuOz\r\ne2LQA8Oom10TDnGYVQI55OiLMlBw087bH+0PS9AwK0U92UUjfxKFy7baWi6b88eT\r\nB5sXCfFVZQKBgEuwhSOBh+j3fkYcLU9UttpredEb1DM+6dG1h5uQby8dBkKaC4Yv\r\nzpBAhzh6tRHY5HpZUSIL4MjOvGTFS9Z/PU46DLKKKJAOWNHoB8T7+VJd9JSfzAI+\r\nQsRem8VRsAwLqYeWX1Ambd0YxO91hdGbNGvHn+bOnIUdqjtF2nbXOGOXAoGAYfqb\r\n6x5nphIEUi5RgeHOsxQ6j196f7ssogDi9jr/UQPrUTYFk0anrcUbZcUhBGYnLTNK\r\nlPEUQlBiVFoYmPLgS4dHNA1NqVcJqGJTRmGh82OuzWlXjWUj6rplDBVFVkhWehlC\r\nLq4d5dF3tnP+c3KnGMiAzCFMVPk5lnxRirVgnKkCgYBEclWCd5v1P6vD0f1HhGIN\r\nRTm0oNgRUK0zKx1qYZRZnQElQ/p9uKg/RcM7dYocIjzT25f2idhWGeriRVA5d1f1\r\n7334m5M5JczKzEyISGWYq0MMfFJXMj8JB9z8hJxWKcjq0Q8LO9GwUXQY8ktPBOxc\r\nMfQULQ6A28dXKRxcvAKFJg==\r\n-----END PRIVATE KEY-----'

interface ResponseWithUser {
  status?: string
  data: UserModel
  iat?: number
  exp?: number
  bid?: number
}

interface IAuthenticatedUsers {
  tokenMap: Record<string, ResponseWithUser>
  idMap: Record<string, string>
  put: (token: string, user: ResponseWithUser) => void
  get: (token?: string) => ResponseWithUser | undefined
  tokenOf: (user: UserModel) => string | undefined
  from: (req: Request) => ResponseWithUser | undefined
  updateFrom: (req: Request, user: ResponseWithUser) => any
}

export const hash = (data: string) => crypto.createHash('md5').update(data).digest('hex')
export const hmac = (data: string) => crypto.createHmac('sha256', 'pa4qacea4VK9t9nGv7yZtwmj').update(data).digest('hex')

export const cutOffPoisonNullByte = (str: string) => {
  const nullByte = '%00'
  if (utils.contains(str, nullByte)) {
    return str.substring(0, str.indexOf(nullByte))
  }
  return str
}

export const isAuthorized = () => expressJwt({ secret: publicKey, algorithms: ['RS256', 'HS256', 'none'] } as any)
export const denyAll = () => expressJwt({ secret: '' + Math.random(), algorithms: ['RS256'] } as any)
export const authorize = (user = {}) => jwt.sign(user, privateKey, { expiresIn: '6h', algorithm: 'RS256' })
export const verify = (token: string) => token ? (jws.verify as ((token: string, secret: string) => boolean))(token, publicKey) : false
export const decode = (token: string) => { return jws.decode(token)?.payload }

export const sanitizeHtml = (html: string) => sanitizeHtmlLib(html)
export const sanitizeLegacy = (input = '') => input.replace(/<(?:\w+)\W+?[\w]/gi, '')
export const sanitizeFilename = (filename: string) => sanitizeFilenameLib(filename)
export const sanitizeSecure = (html: string): string => {
  const sanitized = sanitizeHtml(html)
  if (sanitized === html) {
    return html
  } else {
    return sanitizeSecure(sanitized)
  }
}

export const authenticatedUsers: IAuthenticatedUsers = {
  tokenMap: {},
  idMap: {},
  put: function (token: string, user: ResponseWithUser) {
    this.tokenMap[token] = user
    this.idMap[user.data.id] = token
  },
  get: function (token?: string) {
    return token ? this.tokenMap[utils.unquote(token)] : undefined
  },
  tokenOf: function (user: UserModel) {
    return user ? this.idMap[user.id] : undefined
  },
  from: function (req: Request) {
    const token = utils.jwtFrom(req)
    return token ? this.get(token) : undefined
  },
  updateFrom: function (req: Request, user: ResponseWithUser) {
    const token = utils.jwtFrom(req)
    this.put(token, user)
  }
}

export const userEmailFrom = ({ headers }: any) => {
  return headers ? headers['x-user-email'] : undefined
}

export const generateCoupon = (discount: number, date = new Date()) => {
  const coupon = utils.toMMMYY(date) + '-' + discount
  return z85.encode(coupon)
}

export const discountFromCoupon = (coupon?: string) => {
  if (!coupon) {
    return undefined
  }
  const decoded = z85.decode(coupon)
  if (decoded && (hasValidFormat(decoded.toString()) != null)) {
    const parts = decoded.toString().split('-')
    const validity = parts[0]
    if (utils.toMMMYY(new Date()) === validity) {
      const discount = parts[1]
      return parseInt(discount)
    }
  }
}

function hasValidFormat (coupon: string) {
  return coupon.match(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[0-9]{2}-[0-9]{2}/)
}

// vuln-code-snippet start redirectCryptoCurrencyChallenge redirectChallenge
export const redirectAllowlist = new Set([
  'https://github.com/juice-shop/juice-shop',
  'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm', // vuln-code-snippet vuln-line redirectCryptoCurrencyChallenge
  'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW', // vuln-code-snippet vuln-line redirectCryptoCurrencyChallenge
  'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6', // vuln-code-snippet vuln-line redirectCryptoCurrencyChallenge
  'http://shop.spreadshirt.com/juiceshop',
  'http://shop.spreadshirt.de/juiceshop',
  'https://www.stickeryou.com/products/owasp-juice-shop/794',
  'http://leanpub.com/juice-shop'
])

export const isRedirectAllowed = (url: string) => {
  let allowed = false
  for (const allowedUrl of redirectAllowlist) {
    allowed = allowed || url.includes(allowedUrl) // vuln-code-snippet vuln-line redirectChallenge
  }
  return allowed
}
// vuln-code-snippet end redirectCryptoCurrencyChallenge redirectChallenge

export const roles = {
  customer: 'customer',
  deluxe: 'deluxe',
  accounting: 'accounting',
  admin: 'admin'
}

export const deluxeToken = (email: string) => {
  const hmac = crypto.createHmac('sha256', privateKey)
  return hmac.update(email + roles.deluxe).digest('hex')
}

export const isAccounting = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = verify(utils.jwtFrom(req)) && decode(utils.jwtFrom(req))
    if (decodedToken?.data?.role === roles.accounting) {
      next()
    } else {
      res.status(403).json({ error: 'Malicious activity detected' })
    }
  }
}

export const isDeluxe = (req: Request) => {
  const decodedToken = verify(utils.jwtFrom(req)) && decode(utils.jwtFrom(req))
  return decodedToken?.data?.role === roles.deluxe && decodedToken?.data?.deluxeToken && decodedToken?.data?.deluxeToken === deluxeToken(decodedToken?.data?.email)
}

export const isCustomer = (req: Request) => {
  const decodedToken = verify(utils.jwtFrom(req)) && decode(utils.jwtFrom(req))
  return decodedToken?.data?.role === roles.customer
}

export const appendUserId = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.UserId = authenticatedUsers.tokenMap[utils.jwtFrom(req)].data.id
      next()
    } catch (error: any) {
      res.status(401).json({ status: 'error', message: error })
    }
  }
}

export const updateAuthenticatedUsers = () => (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token || utils.jwtFrom(req)
  if (token) {
    jwt.verify(token, publicKey, (err: Error | null, decoded: any) => {
      if (err === null) {
        if (authenticatedUsers.get(token) === undefined) {
          authenticatedUsers.put(token, decoded)
          res.cookie('token', token)
        }
      }
    })
  }
  next()
}
