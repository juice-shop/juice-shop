const process = require('process')
const semver = require('semver')
const pjson = require('./../../package.json')

const validatePreconditions = ({ exitOnFailure = true } = {}) => {
  try {
    checkIfRunningOnSupportedNodeVersion(process.version)
  } catch (err) {
    console.error(err.message)
    console.error()
    console.error('The application will exit because of an unmet precondition. Check the lines above for more information.')

    if (exitOnFailure) {
      process.exit(1)
    }
    return false
  }
  return true
}

const checkIfRunningOnSupportedNodeVersion = (runningVersion) => {
  const supportedVersion = pjson.engines.node
  const effectiveVersionRange = semver.validRange(supportedVersion)
  if (!semver.satisfies(runningVersion, effectiveVersionRange)) {
    throw new Error(`Your Node version ${runningVersion} does not satisfy the supported version range of ${supportedVersion}`)
  }
  return true
}

validatePreconditions.checkIfRunningOnSupportedNodeVersion = checkIfRunningOnSupportedNodeVersion

module.exports = validatePreconditions
