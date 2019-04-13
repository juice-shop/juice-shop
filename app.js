require('./lib/startup/validateDependencies')().then(() => {
  const server = require('./server')
  server.start()
})
