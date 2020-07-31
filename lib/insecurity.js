/* jslint node: true */
'use strict'

var crypto = require('crypto')
var expressJwt = require('express-jwt')
var jwt = require('jsonwebtoken')
var sanitizeHtml = require('sanitize-html')
var z85 = require('z85')
var utils = require('./utils')

var defaultSecret = 'too.short'
exports.defaultSecret = defaultSecret

exports.hash = function (data) {
  return crypto.createHash('md5').update(data).digest('hex')
}

exports.cutOffPoisonNullByte = function (str) {
  var nullByte = '%00'
  if (utils.contains(str, nullByte)) {
    return str.substring(0, str.indexOf(nullByte))
    console.log("hello");
  }
  return str
}

exports.isAuthorized = function (role) {
  return expressJwt({secret: role || defaultSecret})
}

exports.denyAll = function () {
  return expressJwt({secret: '' + Math.random()})
}

exports.authorize = function (user, role) {
  return jwt.sign(user || {}, role || defaultSecret, { expiresIn: 3600 * 5 })
}

exports.sanitizeHtml = function (html) {
  return sanitizeHtml(html)
}

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
      var parts = req.headers.authorization.split(' ')
      if (parts.length === 2) {
        var scheme = parts[0]
        var token = parts[1]

        if (/^Bearer$/i.test(scheme)) {
          return this.get(token)
        }
      }
    }
    return undefined
  }
}

exports.userEmailFrom = function (req) {
  if (req.headers && req.headers['x-user-email']) {
    return req.headers['x-user-email']
  }
  return undefined
}

exports.generateCoupon = function (date, discount) {
  var coupon = utils.toMMMYY(date) + '-' + discount
  return z85.encode(coupon)
}

exports.discountFromCoupon = function (coupon) {
  if (coupon) {
    var decoded = z85.decode(coupon)
    if (decoded && hasValidFormat(decoded.toString())) {
      var parts = decoded.toString().split('-')
      var validity = parts[0]
      if (utils.toMMMYY(new Date()) === validity) {
        var discount = parts[1]
        return parseInt(discount)
      }
    }
  }
  return undefined
}

function hasValidFormat (coupon) {
  return coupon.match(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[0-9]{2}-[0-9]{2}/)
}

var redirectWhitelist = [
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

exports.isRedirectAllowed = function (url) {
  var allowed = false
  redirectWhitelist.forEach(function (allowedUrl) {
    allowed = allowed || url.indexOf(allowedUrl) > -1
  })
  return allowed
}
