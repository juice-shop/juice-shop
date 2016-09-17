/* jslint node: true */
'use strict'

var colors = require('colors/safe')
var packageJson = require('../package.json')

var winston = require('winston')
exports.logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'server.log' })
  ]
})

var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

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

exports.solve = function (challenge) {
  challenge.solved = true
  challenge.save().success(function () {
    console.log(colors.green('Solved') + ' challenge ' + colors.cyan(challenge.name) + ' (' + challenge.description + ')')
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
