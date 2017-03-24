'use strict'

var spawn = require('cross-spawn')
var colors = require('colors/safe')
var server = require('./../server.js')
var config = require('config')

server.start(config, function () {
  var protractor = spawn('protractor', [ 'protractor.conf.js' ])
  function logToConsole (data) {
    console.log(String(data))
  }

  protractor.stdout.on('data', logToConsole)
  protractor.stderr.on('data', logToConsole)

  protractor.on('exit', function (exitCode) {
    console.log('Protractor exited with code ' + exitCode + ' (' + (exitCode === 0 ? colors.green('SUCCESS') : colors.red('FAILED')) + ')')
    server.close(exitCode)
  })
})
