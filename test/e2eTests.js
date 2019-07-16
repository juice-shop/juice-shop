const spawn = require('cross-spawn')
const colors = require('colors/safe')
const server = require('./../server.js')

server.start(() => {
  const protractor = spawn('protractor', ['protractor.conf.js'])
  function logToConsole (data) {
    console.log(String(data))
  }

  protractor.stdout.on('data', logToConsole)
  protractor.stderr.on('data', logToConsole)

  protractor.on('exit', exitCode => {
    console.log('Protractor exited with code ' + exitCode + ' (' + (exitCode === 0 ? colors.green('SUCCESS') : colors.red('FAILED')) + ')')
    server.close(exitCode)
  })
})
