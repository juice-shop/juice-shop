const process = require('process')
const semver = require('semver')
const pjson = require('./../../package.json')
const colors = require('colors/safe')
const logger = require('../logger')
const portscanner = require('portscanner')

const validatePreconditions = ({ exitOnFailure = true } = {}) => {
  let success = true
  let portSuccess = true
  success = checkIfRunningOnSupportedNodeVersion(process.version) && success
  portSuccess = checkIfPortIsAvailable(3000) && portSuccess
  if (!success && !portSuccess && exitOnFailure) {
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
  portscanner.checkPortStatus(port, function (status) {
    if (status === 'open') {
      logger.warn(`Port ${port} is not available (${colors.red('NOT OK')})`)
      return false
    }
    logger.info(`Port ${port} is available (${colors.green('OK')})`)
    return true
  })
}

validatePreconditions.checkIfRunningOnSupportedNodeVersion = checkIfRunningOnSupportedNodeVersion
validatePreconditions.checkIfPortIsAvailable = checkIfPortIsAvailable

module.exports = validatePreconditions
