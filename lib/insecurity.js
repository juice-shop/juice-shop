/* jslint node: true */
'use strict'

const crypto = require('crypto')
const expressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')
const sanitizeHtml = require('sanitize-html')
const z85 = require('z85')
const utils = require('./utils')

const defaultSecret = 'JOSE'
exports.defaultSecret = defaultSecret

exports.hash = data => crypto.createHash('md5').update(data).digest('hex')

exports.hmac = data => crypto.createHmac('sha256', '07-92-75-2C-DB-D3').update(data).digest('hex')

exports.cutOffPoisonNullByte = str => {
  const nullByte = '%00'
  if (utils.contains(str, nullByte)) {
    return str.substring(0, str.indexOf(nullByte))
  }
  return str
}

exports.isAuthorized = role => expressJwt({secret: role || defaultSecret})

exports.denyAll = () => expressJwt({secret: '' + Math.random()})

exports.authorize = (user, role) => jwt.sign(user || {}, role || defaultSecret, { expiresIn: 3600 * 5 })

exports.sanitizeHtml = html => sanitizeHtml(html)

exports.authenticatedUsers = {
  tokenMap: {},
  idMap: {},
  put: function (token, user) {
    this.tokenMap[token] = user
    this.idMap[user.data.id] = token
  },
  get: function (token) {
    if (token) {
      return this.tokenMap[utils.unquote(token)]
    } else {
      return undefined
    }
  },
  tokenOf: function (user) {
    if (user) {
      return this.idMap[user.id]
    } else {
      return undefined
    }
  },
  from: function (req) {
    if (req.headers && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ')
      if (parts.length === 2) {
        const scheme = parts[0]
        const token = parts[1]

        if (/^Bearer$/i.test(scheme)) {
          return this.get(token)
        }
      }
    }
    return undefined
  }
}

exports.userEmailFrom = req => {
  if (req.headers && req.headers['x-user-email']) {
    return req.headers['x-user-email']
  }
  return undefined
}

exports.generateCoupon = (date, discount) => {
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

const redirectWhitelist = [
  'https://github.com/bkimminich/juice-shop',
  'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
  'https://gratipay.com/juice-shop',
  'http://flattr.com/thing/3856930/bkimminichjuice-shop-on-GitHub',
  'http://shop.spreadshirt.com/juiceshop',
  'http://shop.spreadshirt.de/juiceshop',
  'https://www.stickermule.com/user/1070702817/stickers',
  'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW'
]
exports.redirectWhitelist = redirectWhitelist

exports.isRedirectAllowed = url => {
  let allowed = false
  redirectWhitelist.forEach(allowedUrl => {
    allowed = allowed || url.indexOf(allowedUrl) > -1
  })
  return allowed
}
