let dependencyChecker = {}
let logger = {}
let colors = {}

try {
  dependencyChecker = require('check-dependencies')
  logger = require('../logger')
  colors = require('colors/safe')
} catch (err) {
  console.log('Dependencies could not be checked due to "' + err.message + '" error (NOT OK)')
  process.exit(1)
}

const validateDependencies = async ({ exitOnFailure = true } = {}) => {
  let success = true
  let dependencies = {}
  try {
    dependencies = await dependencyChecker()
  } catch (err) {
    logger.warn(`Dependencies could not be checked due to "${err.message}" error (${colors.red('NOT OK')})`)
  }

  if (dependencies.depsWereOk === true) {
    logger.info(`All dependencies are satisfied (${colors.green('OK')})`)
  } else {
    logger.warn(`Dependencies are not rightly satisfied (${colors.red('NOT OK')})`)
    success = false
    for (let err of dependencies.error) {
      console.log(err)
    }
  }

  if (!success && exitOnFailure) {
    logger.error(colors.red('Exiting due to unsatisfied dependencies!'))
    process.exit(1)
  }
}

module.exports = validateDependencies
