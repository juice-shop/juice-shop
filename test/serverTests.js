'use strict'

var spawn = require('cross-spawn')
var colors = require('colors/safe')
var server = require('./../server.js')
var config = require('config')

server.start(config, function () {
  var jasmineNode = spawn('jasmine-node', [ 'test/server', '--junitreport', '--output', 'build/reports/server_results' ])
  function logToConsole (data) {
    console.log(String(data))
  }

  jasmineNode.stdout.on('data', logToConsole)
  jasmineNode.stderr.on('data', logToConsole)

  jasmineNode.on('exit', function (exitCode) {
    console.log('Jasmine-Node exited with code ' + exitCode + ' (' + (exitCode === 0 ? colors.green('SUCCESS') : colors.red('FAILED')) + ')')
    server.close(exitCode)
  })
})
