'use strict'

const spawn = require('cross-spawn')
const colors = require('colors/safe')
const server = require('./../server.js')

server.start(() => {
  const jest = spawn('jest')
  function logToConsole (data) {
    console.log(String(data))
  }

  jest.stdout.on('data', logToConsole)
  jest.stderr.on('data', logToConsole)

  jest.on('exit', exitCode => {
    console.log('Jest exited with code ' + exitCode + ' (' + (exitCode === 0 ? colors.green('SUCCESS') : colors.red('FAILED')) + ')')
    server.close(exitCode)
  })
})
