/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
const crypto = require('crypto')
const expressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')
const jws = require('jws')
const sanitizeHtml = require('sanitize-html')
const sanitizeFilename = require('sanitize-filename')
const z85 = require('z85')
const utils = require('./utils')
const fs = require('fs')

const publicKey = fs.readFileSync('encryptionkeys/jwt.pub', 'utf8')
module.exports.publicKey = publicKey
const privateKey = '-----BEGIN RSA PRIVATE KEY-----\r\nMIICXAIBAAKBgQDNwqLEe9wgTXCbC7+RPdDbBbeqjdbs4kOPOIGzqLpXvJXlxxW8iMz0EaM4BKUqYsIa+ndv3NAn2RxCd5ubVdJJcX43zO6Ko0TFEZx/65gY3BE0O6syCEmUP4qbSd6exou/F+WTISzbQ5FBVPVmhnYhG/kpwt/cIxK5iUn5hm+4tQIDAQABAoGBAI+8xiPoOrA+KMnG/T4jJsG6TsHQcDHvJi7o1IKC/hnIXha0atTX5AUkRRce95qSfvKFweXdJXSQ0JMGJyfuXgU6dI0TcseFRfewXAa/ssxAC+iUVR6KUMh1PE2wXLitfeI6JLvVtrBYswm2I7CtY0q8n5AGimHWVXJPLfGV7m0BAkEA+fqFt2LXbLtyg6wZyxMA/cnmt5Nt3U2dAu77MzFJvibANUNHE4HPLZxjGNXN+a6m0K6TD4kDdh5HfUYLWWRBYQJBANK3carmulBwqzcDBjsJ0YrIONBpCAsXxk8idXb8jL9aNIg15Wumm2enqqObahDHB5jnGOLmbasizvSVqypfM9UCQCQl8xIqy+YgURXzXCN+kwUgHinrutZms87Jyi+D8Br8NY0+Nlf+zHvXAomD2W5CsEK7C+8SLBr3k/TsnRWHJuECQHFE9RA2OP8WoaLPuGCyFXaxzICThSRZYluVnWkZtxsBhW2W8z1b8PvWUE7kMy7TnkzeJS2LSnaNHoyxi7IaPQUCQCwWU4U+v4lD7uYBw00Ga/xt+7+UqFPlPVdz1yyr4q24Zxaw0LgmuEvgU5dycq8N7JxjTubX0MIRR+G9fmDBBl8=\r\n-----END RSA PRIVATE KEY-----'

exports.hash = data => crypto.createHash('md5').update(data).digest('hex')
exports.hmac = data => crypto.createHmac('sha256', 'pa4qacea4VK9t9nGv7yZtwmj').update(data).digest('hex')

exports.cutOffPoisonNullByte = str => {
  const nullByte = '%00'
  if (utils.contains(str, nullByte)) {
    return str.substring(0, str.indexOf(nullByte))
  }
  return str
}

exports.isAuthorized = () => expressJwt({ secret: this.publicKey })
exports.denyAll = () => expressJwt({ secret: '' + Math.random() })
exports.authorize = (user = {}) => jwt.sign(user, privateKey, { expiresInMinutes: 60 * 5, algorithm: 'RS256' })
exports.verify = (token) => jws.verify(token, publicKey)
exports.decode = (token) => { return jws.decode(token).payload }

exports.sanitizeHtml = html => sanitizeHtml(html)
exports.sanitizeLegacy = (input = '') => input.replace(/<(?:\w+)\W+?[\w]/gi, '')
exports.sanitizeFilename = filename => sanitizeFilename(filename)
exports.sanitizeSecure = html => {
  const sanitized = this.sanitizeHtml(html)
  if (sanitized === html) {
    return html
  } else {
    return this.sanitizeSecure(sanitized)
  }
}

exports.authenticatedUsers = {
  tokenMap: {},
  idMap: {},
  put: function (token, user) {
    this.tokenMap[token] = user
    this.idMap[user.data.id] = token
  },
  get: function (token) {
    return token ? this.tokenMap[utils.unquote(token)] : undefined
  },
  tokenOf: function (user) {
    return user ? this.idMap[user.id] : undefined
  },
  from: function (req) {
    const token = utils.jwtFrom(req)
    return token ? this.get(token) : undefined
  },
  updateFrom: function (req, user) {
    const token = utils.jwtFrom(req)
    this.put(token, user)
  }
}

exports.userEmailFrom = ({ headers }) => {
  return headers ? headers['x-user-email'] : undefined
}

exports.generateCoupon = (discount, date = new Date()) => {
  const coupon = utils.toMMMYY(date) + '-' + discount
  return z85.encode(coupon)
}

exports.discountFromCoupon = coupon => {
  if (coupon) {
    const decoded = z85.decode(coupon)
    if (decoded && hasValidFormat(decoded.toString())) {
      const parts = decoded.toString().split('-')
      const validity = parts[0]
      if (utils.toMMMYY(new Date()) === validity) {
        const discount = parts[1]
        return parseInt(discount)
      }
    }
  }
  return undefined
}

function hasValidFormat (coupon) {
  return coupon.match(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[0-9]{2}-[0-9]{2}/)
}

const redirectWhitelist = new Set([
  'https://github.com/bkimminich/juice-shop',
  'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
  'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
  'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6',
  'http://shop.spreadshirt.com/juiceshop',
  'http://shop.spreadshirt.de/juiceshop',
  'https://www.stickeryou.com/products/owasp-juice-shop/794',
  'http://leanpub.com/juice-shop'
])
exports.redirectWhitelist = redirectWhitelist

exports.isRedirectAllowed = url => {
  let allowed = false
  for (const allowedUrl of redirectWhitelist) {
    allowed = allowed || url.includes(allowedUrl)
  }
  return allowed
}

exports.roles = {
  customer: 'customer',
  deluxe: 'deluxe',
  accounting: 'accounting',
  admin: 'admin'
}

exports.deluxeToken = (email) => {
  const hmac = crypto.createHmac('sha256', privateKey)
  return hmac.update(email + this.roles.deluxe).digest('hex')
}

exports.isAccounting = () => {
  return (req, res, next) => {
    const decodedToken = this.verify(utils.jwtFrom(req)) && this.decode(utils.jwtFrom(req))
    if (decodedToken && decodedToken.data && decodedToken.data.role === exports.roles.accounting) {
      next()
    } else {
      res.status(403).json({ error: 'Malicious activity detected' })
    }
  }
}

exports.isDeluxe = (req) => {
  const decodedToken = this.verify(utils.jwtFrom(req)) && this.decode(utils.jwtFrom(req))
  return decodedToken && decodedToken.data && decodedToken.data.role === exports.roles.deluxe && decodedToken.data.deluxeToken && decodedToken.data.deluxeToken === this.deluxeToken(decodedToken.data.email)
}

exports.isCustomer = (req) => {
  const decodedToken = this.verify(utils.jwtFrom(req)) && this.decode(utils.jwtFrom(req))
  return decodedToken && decodedToken.data && decodedToken.data.role === exports.roles.customer
}

exports.appendUserId = () => {
  return (req, res, next) => {
    try {
      req.body.UserId = this.authenticatedUsers.tokenMap[utils.jwtFrom(req)].data.id
      next()
    } catch (error) {
      res.status(401).json({ status: 'error', message: error })
    }
  }
}

exports.updateAuthenticatedUsers = () => (req, res, next) => {
  const token = req.cookies.token || utils.jwtFrom(req)
  if (token) {
    jwt.verify(token, publicKey, (err, decoded) => {
      if (err === null) {
        if (this.authenticatedUsers.get(token) === undefined) {
          this.authenticatedUsers.put(token, decoded)
          res.cookie('token', token)
        }
      }
    })
  }
  next()
}
