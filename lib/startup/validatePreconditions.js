const process = require('process')
const semver = require('semver')
const pjson = require('./../../package.json')
const colors = require('colors/safe')

const validatePreconditions = ({ exitOnFailure = true } = {}) => {
  let success = true
  success = checkIfRunningOnSupportedNodeVersion(process.version) && success

  if (!success && exitOnFailure) {
    console.error()
    console.error(colors.red('Exiting due to unsatisfied precondition(s)!'))
    console.error()
    process.exit(1)
  }
  return success
}

const checkIfRunningOnSupportedNodeVersion = (runningVersion) => {
  const supportedVersion = pjson.engines.node
  const effectiveVersionRange = semver.validRange(supportedVersion)
  if (!semver.satisfies(runningVersion, effectiveVersionRange)) {
    console.error(`Detected Node version ${colors.bold(runningVersion)} is not in the supported version range of ${supportedVersion} (${colors.red('NOT OK')})`)
    return false
  }
  console.log(`Detected Node.js version ${colors.bold(runningVersion)} (${colors.green('OK')})`)
  return true
}

validatePreconditions.checkIfRunningOnSupportedNodeVersion = checkIfRunningOnSupportedNodeVersion

module.exports = validatePreconditions
