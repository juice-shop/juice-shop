/* jslint node: true */
'use strict'

var fs = require('fs')
var request = require('request')
var colors = require('colors/safe')
var notifications = require('../data/datacache').notifications
var challenges = require('../data/datacache').challenges
var packageJson = require('../package.json')
var sanitizeHtml = require('sanitize-html')
var jsSHA = require('jssha')
var Entities = require('html-entities').AllHtmlEntities
var config = require('config')
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
        wrappedData.push(data[i] && data[i].dataValues ? data[i].dataValues : data[i])
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
  var self = this
  challenge.solved = true
  challenge.save().success(function () {
    challenge.description = entities.decode(sanitizeHtml(challenge.description, {
      allowedTags: [],
      allowedAttributes: []
    }))
    console.log(colors.green('Solved') + ' challenge ' + colors.cyan(challenge.name) + ' (' + challenge.description + ')')
    self.notify(challenge)
  })
}

exports.notify = function (challenge) {
  if (!this.notSolved(challenge)) {
    var flag = this.toHmac(challenge.name)
    var notification = {
      name: challenge.name,
      challenge: challenge.name + ' (' + challenge.description + ')',
      flag: flag,
      hidden: !config.get('application.showChallengeSolvedNotifications')
    }
    notifications.push(notification)
    if (global.io) {
      global.io.emit('challenge solved', notification)
    }
  }
}

exports.notSolved = function (challenge) {
  return challenge && !challenge.solved
}

exports.findChallenge = function (challengeName) {
  for (var name in challenges) {
    if (challenges.hasOwnProperty(name)) {
      if (challenges[name].name === challengeName) {
        return challenges[name]
      }
    }
  }
  console.error('missing challenge with name: ' + challengeName)
}

exports.toMMMYY = function (date) {
  var month = date.getMonth()
  var year = date.getFullYear()
  return months[month] + year.toString().substring(2, 4)
}

exports.downloadToFile = function (url, dest, cb) {
  var file = fs.createWriteStream(dest)
  var sendReq = request.get(url)

  sendReq.on('response', function (response) {
    if (cb && response.statusCode !== 200) {
      return cb(new Error('Response status was ' + response.statusCode))
    }
  })

  sendReq.on('error', function (err) {
    fs.unlink(dest)
    if (cb) {
      return cb(err.message)
    } else {
      console.error('Problem downloading file: ' + err.message)
    }
  })

  sendReq.pipe(file)

  file.on('finish', function () {
    file.close(cb)
  })

  file.on('error', function (err) { // Handle errors
    fs.unlink(dest)
    if (cb) {
      return cb(err.message)
    } else {
      console.error('Problem writing downloaded file: ' + err.message)
    }
  })
}
