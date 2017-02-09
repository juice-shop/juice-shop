/* jslint node: true */
'use strict'

var fs = require('fs')
var colors = require('colors/safe')
var notifications = require('../data/datacache').notifications
var packageJson = require('../package.json')
var sanitizeHtml = require('sanitize-html')
var jsSHA = require('jssha')
var Entities = require('html-entities').AllHtmlEntities
var entities = new Entities()

var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

var ctfKey
fs.readFile('ctf.key', 'utf8', function (err, data) {
  if (err) {
    throw err
  }
  ctfKey = data
})

exports.queryResultToJson = function (data, status) {
  var wrappedData = {}
  if (data) {
    if (!data.length && data.dataValues) {
      wrappedData = data.dataValues
    } else if (data.length > 0) {
      wrappedData = []
      for (var i = 0; i < data.length; i++) {
        wrappedData.push(data[i].dataValues ? data[i].dataValues : data[i])
      }
    } else {
      wrappedData = data
    }
  }
  return {
    status: status || 'success',
    data: wrappedData
  }
}

exports.startsWith = function (str, prefix) {
  return str ? str.indexOf(prefix) === 0 : false
}

exports.endsWith = function (str, suffix) {
  return str ? str.indexOf(suffix, str.length - suffix.length) !== -1 : false
}

exports.contains = function (str, element) {
  return str ? str.indexOf(element) !== -1 : false
}

exports.containsEscaped = function (str, element) {
  return this.contains(str, element.replace(/"/g, '\\"'))
}

exports.containsOrEscaped = function (str, element) {
  return this.contains(str, element) || this.containsEscaped(str, element)
}

exports.unquote = function (str) {
  if (str && this.startsWith(str, '"') && this.endsWith(str, '"')) {
    return str.substring(1, str.length - 1)
  } else {
    return str
  }
}

exports.version = function (module) {
  if (module) {
    return packageJson.dependencies[module]
  } else {
    return packageJson.version
  }
}

exports.toHmac = function (text) {
  var shaObj = new jsSHA('SHA-1', 'TEXT') // eslint-disable-line new-cap
  shaObj.setHMACKey(ctfKey, 'TEXT')
  shaObj.update(text)
  return shaObj.getHMAC('HEX')
}

exports.solve = function (challenge) {
  var flag = this.toHmac(challenge.name)
  challenge.solved = true
  challenge.save().success(function () {
    challenge.description = entities.decode(sanitizeHtml(challenge.description, {
      allowedTags: [],
      allowedAttributes: []
    }))
    console.log(colors.green('Solved') + ' challenge ' + colors.cyan(challenge.name) + ' (' + challenge.description + ')')
    notifications[flag] = {challenge: challenge.name + ' (' + challenge.description + ')', flag: flag}
    if (global.io) {
      global.io.emit('challenge solved', notifications[flag])
    }
  })
}

exports.notSolved = function (challenge) {
  return challenge && !challenge.solved
}

exports.toMMMYY = function (date) {
  var month = date.getMonth()
  var year = date.getFullYear()
  return months[month] + year.toString().substring(2, 4)
}
