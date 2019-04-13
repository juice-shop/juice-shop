const config = require('config')
const process = require('process')
const semver = require('semver')
const pjson = require('./../../package.json')
const colors = require('colors/safe')
const logger = require('../logger')
const portscanner = require('portscanner')

const validatePreconditions = async ({ exitOnFailure = true } = {}) => {
  let success = true
  success = checkIfRunningOnSupportedNodeVersion(process.version) && success
  const portSuccess = await checkIfPortIsAvailable(process.env.PORT || config.get('server.port'))

  if ((!success || !portSuccess) && exitOnFailure) {
    logger.error(colors.red('Exiting due to unsatisfied precondition!'))
    process.exit(1)
  }
  return success
}

const checkIfRunningOnSupportedNodeVersion = (runningVersion) => {
  const supportedVersion = pjson.engines.node
  const effectiveVersionRange = semver.validRange(supportedVersion)
  if (!semver.satisfies(runningVersion, effectiveVersionRange)) {
    logger.warn(`Detected Node version ${colors.bold(runningVersion)} is not in the supported version range of ${supportedVersion} (${colors.red('NOT OK')})`)
    return false
  }
  logger.info(`Detected Node.js version ${colors.bold(runningVersion)} (${colors.green('OK')})`)
  return true
}

const checkIfPortIsAvailable = (port) => {
  return new Promise((resolve, reject) => {
    portscanner.checkPortStatus(port, function (error, status) {
      if (error) {
        reject(error)
      } else {
        if (status === 'open') {
          logger.warn(`Port ${colors.bold(port)} is in use (${colors.red('NOT OK')})`)
          resolve(false)
        } else {
          logger.info(`Port ${colors.bold(port)} is available (${colors.green('OK')})`)
          resolve(true)
        }
      }
    })
  })
}

validatePreconditions.checkIfRunningOnSupportedNodeVersion = checkIfRunningOnSupportedNodeVersion
validatePreconditions.checkIfPortIsAvailable = checkIfPortIsAvailable

module.exports = validatePreconditions
