const dependencyCheck = require('check-dependencies')
const logger = require('../logger')
const colors = require('colors/safe')

const validateDependencies = async ({ exitOnFailure = true } = {}) => {
  await dependencyCheck().then((val) => {
    if (val.depsWereOk === true) {
      logger.info(`All dependencies are satisfied (${colors.green('OK')})`)
    } else {
      logger.warn(`Dependencies are not rightly satisfied (${colors.red('NOT OK')})`)
      for (var i in val.error) {
        console.log(val.error[i])
      }
      logger.error(colors.red('Exiting due to unsatisfied dependencies!'))
      process.exit(1)
    }
  }, () => {
    logger.error(colors.red('Exiting due to error in dependency check!  '))
  })
}

module.exports = validateDependencies
