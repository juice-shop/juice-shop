const dependencyCheck = require('check-dependencies')
const logger = require('../logger')
const colors = require('colors/safe')

const validateDependencies = async ({ exitOnFailure = true } = {}) => {
  let success = true
  await dependencyCheck().then((val) => {
    if (val.depsWereOk === true) {
      logger.info(`All dependencies are satisfied (${colors.green('OK')})`)
    } else {
      logger.warn(`Dependencies are not rightly satisfied (${colors.red('NOT OK')})`)
      success = false
      for (var i in val.error) {
        console.log(val.error[i])
      }
    }
  }, (err) => {
    logger.warn(`Dependencies could not be checked due to "${err.message}" error (${colors.red('NOT OK')})`)
  })

  if (!success && exitOnFailure) {
    logger.error(colors.red('Exiting due to unsatisfied dependencies!'))
    process.exit(1)
  }
}

module.exports = validateDependencies
