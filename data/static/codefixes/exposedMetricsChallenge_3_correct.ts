/* Serve metrics */
const Metrics = metrics.observeMetrics()
const metricsUpdateLoop = Metrics.updateLoop()
app.get('/metrics', security.isAdmin(), metrics.serveMetrics())
errorhandler.title = `${config.get('application.name')} (Express ${utils.version('express')})`

const registerWebsocketEvents = require('./lib/startup/registerWebsocketEvents')
const customizeApplication = require('./lib/startup/customizeApplication')

export async function start (readyCallback: Function) {
  const datacreatorEnd = startupGauge.startTimer({ task: 'datacreator' })
  await sequelize.sync({ force: true })
  await datacreator()
  datacreatorEnd()
  const port = process.env.PORT ?? config.get('server.port')
  process.env.BASE_PATH = process.env.BASE_PATH ?? config.get('server.basePath')

  server.listen(port, () => {
    logger.info(colors.cyan(`Server listening on port ${colors.bold(port)}`))
    startupGauge.set({ task: 'ready' }, (Date.now() - startTime) / 1000)
    if (process.env.BASE_PATH !== '') {
      logger.info(colors.cyan(`Server using proxy base path ${colors.bold(process.env.BASE_PATH)} for redirects`))
    }
    registerWebsocketEvents(server)
    if (readyCallback) {
      readyCallback()
    }
  })

}

export function close (exitCode: number | undefined) {
  if (server) {
    clearInterval(metricsUpdateLoop)
    server.close()
  }
  if (exitCode !== undefined) {
    process.exit(exitCode)
  }
}