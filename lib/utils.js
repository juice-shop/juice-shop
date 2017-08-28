/* jslint node: true */
'use strict'

const fs = require('fs')
const request = require('request')
const colors = require('colors/safe')
const notifications = require('../data/datacache').notifications
const challenges = require('../data/datacache').challenges
const packageJson = require('../package.json')
const sanitizeHtml = require('sanitize-html')
const jsSHA = require('jssha')
const Entities = require('html-entities').AllHtmlEntities
const config = require('config')
const entities = new Entities()

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

let ctfKey
if (process.env.CTF_KEY !== undefined && process.env.CTF_KEY !== '') {
  ctfKey = process.env.CTF_KEY
} else {
  fs.readFile('ctf.key', 'utf8', function (err, data) {
    if (err) {
      throw err
    }
    ctfKey = data
  })
}

exports.queryResultToJson = function (data, status) {
  let wrappedData = {}
  if (data) {
    if (!data.length && data.dataValues) {
      wrappedData = data.dataValues
    } else if (data.length > 0) {
      wrappedData = []
      for (let i = 0; i < data.length; i++) {
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

exports.ctfFlag = function (text) {
  const shaObj = new jsSHA('SHA-1', 'TEXT') // eslint-disable-line new-cap
  shaObj.setHMACKey(ctfKey, 'TEXT')
  shaObj.update(text)
  return shaObj.getHMAC('HEX')
}

exports.solve = function (challenge, isRestore) {
  const self = this
  challenge.solved = true
  challenge.save().success(function (solvedChallenge) {
    solvedChallenge.description = entities.decode(sanitizeHtml(solvedChallenge.description, {
      allowedTags: [],
      allowedAttributes: []
    }))
    console.log(colors.green('Solved') + ' challenge ' + colors.cyan(solvedChallenge.name) + ' (' + solvedChallenge.description + ')')
    self.sendNotification(solvedChallenge, isRestore)
  })
}

exports.sendNotification = function (challenge, isRestore) {
  if (!this.notSolved(challenge)) {
    const flag = this.ctfFlag(challenge.name)
    const notification = {
      name: challenge.name,
      challenge: challenge.name + ' (' + challenge.description + ')',
      flag: flag,
      hidden: !config.get('application.showChallengeSolvedNotifications'),
      isRestore: isRestore
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
  for (const name in challenges) {
    if (challenges.hasOwnProperty(name)) {
      if (challenges[name].name === challengeName) {
        return challenges[name]
      }
    }
  }
  console.error('missing challenge with name: ' + challengeName)
}

exports.toMMMYY = function (date) {
  const month = date.getMonth()
  const year = date.getFullYear()
  return months[month] + year.toString().substring(2, 4)
}

exports.downloadToFile = function (url, dest, cb) {
  const file = fs.createWriteStream(dest)
  const sendReq = request.get(url)

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
