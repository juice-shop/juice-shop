const config = require('config')
const process = require('process')
const semver = require('semver')
const pjson = require('./../../package.json')
const colors = require('colors/safe')
const logger = require('../logger')
const portscanner = require('portscanner')
const path = require('path')
const fs = require('fs-extra')

const validatePreconditions = async ({ exitOnFailure = true } = {}) => {
  let success = true
  success = checkIfRunningOnSupportedNodeVersion(process.version) && success
  success = checkIfRunningOnSupportedOS(process.platform) && success
  success = checkIfRunningOnSupportedCPU(process.arch) && success
  success = checkIfRequiredFileExists('../../frontend/dist/frontend/index.html') && success
  success = checkIfRequiredFileExists('../../frontend/dist/frontend/styles.css') && success
  success = checkIfRequiredFileExists('../../frontend/dist/frontend/main-es2015.js') && success
  success = checkIfRequiredFileExists('../../frontend/dist/frontend/tutorial-es2015.js') && success
  success = checkIfRequiredFileExists('../../frontend/dist/frontend/polyfills-es2015.js') && success
  success = checkIfRequiredFileExists('../../frontend/dist/frontend/runtime-es2015.js') && success
  success = checkIfRequiredFileExists('../../frontend/dist/frontend/vendor-es2015.js') && success
  // Legacy browser support scripts
  success = checkIfRequiredFileExists('../../frontend/dist/frontend/main-es5.js') && success
  success = checkIfRequiredFileExists('../../frontend/dist/frontend/tutorial-es5.js') && success
  success = checkIfRequiredFileExists('../../frontend/dist/frontend/polyfills-es5.js') && success
  success = checkIfRequiredFileExists('../../frontend/dist/frontend/runtime-es5.js') && success
  success = checkIfRequiredFileExists('../../frontend/dist/frontend/vendor-es5.js') && success
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

const checkIfRunningOnSupportedOS = (runningOS) => {
  const supportedOS = pjson.os
  if (supportedOS[runningOS] > -1) {
    logger.warn(`Detected OS ${colors.bold(runningOS)} is not in the list of supported platforms ${supportedOS} (${colors.red('NOT OK')})`)
    return false
  }
  logger.info(`Detected OS ${colors.bold(runningOS)} (${colors.green('OK')})`)
  return true
}

const checkIfRunningOnSupportedCPU = (runningArch) => {
  const supportedArch = pjson.cpu
  if (supportedArch[runningArch] > -1) {
    logger.warn(`Detected CPU ${colors.bold(runningArch)} is not in the list of supported architectures ${supportedArch} (${colors.red('NOT OK')})`)
    return false
  }
  logger.info(`Detected CPU ${colors.bold(runningArch)} (${colors.green('OK')})`)
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

const checkIfRequiredFileExists = (relPath) => {
  const fileName = relPath.substr(relPath.lastIndexOf('/') + 1)
  if (!fs.existsSync(path.resolve(__dirname, relPath))) {
    logger.warn(`Required file ${colors.bold(fileName)} is missing (${colors.red('NOT OK')})`)
    return false
  }
  logger.info(`Required file ${colors.bold(fileName)} is present (${colors.green('OK')})`)
  return true
}

validatePreconditions.checkIfRunningOnSupportedNodeVersion = checkIfRunningOnSupportedNodeVersion
validatePreconditions.checkIfPortIsAvailable = checkIfPortIsAvailable
validatePreconditions.checkIfRequiredFileExists = checkIfRequiredFileExists

module.exports = validatePreconditions
