'use strict'

var spawn = require('cross-spawn')
var colors = require('colors/safe')
var server = require('./../server.js')

server.start(function () {
  var jest = spawn('jest')
  function logToConsole (data) {
    console.log(String(data))
  }

  jest.stdout.on('data', logToConsole)
  jest.stderr.on('data', logToConsole)

  jest.on('exit', function (exitCode) {
    console.log('Jest exited with code ' + exitCode + ' (' + (exitCode === 0 ? colors.green('SUCCESS') : colors.red('FAILED')) + ')')
    server.close(exitCode)
  })
})
