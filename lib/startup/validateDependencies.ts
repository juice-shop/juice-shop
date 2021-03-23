/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

try {
  require('check-dependencies')
} catch (err) {
  console.error('Please run "npm install" before starting the application!')
  process.exit(1)
}
const logger = require('../logger')
import colors = require('colors/safe')
const dependencyChecker = require('check-dependencies')

const validateDependencies = async ({ packageDir = '.', exitOnFailure = true } = {}) => {
  let success = true
  let dependencies = {}
  try {
    dependencies = await dependencyChecker({ packageDir, scopeList: ['dependencies'] })
  } catch (err) {
    logger.warn(`Dependencies in ${colors.bold(packageDir + '/package.json')} could not be checked due to "${err.message}" error (${colors.red('NOT OK')})`)
  }

  if (dependencies.depsWereOk === true) {
    logger.info(`All dependencies in ${colors.bold(packageDir + '/package.json')} are satisfied (${colors.green('OK')})`)
  } else {
    logger.warn(`Dependencies in ${colors.bold(packageDir + '/package.json')} are not rightly satisfied (${colors.red('NOT OK')})`)
    success = false
    for (const err of dependencies.error) {
      logger.warn(err)
    }
  }

  if (!success && exitOnFailure) {
    logger.error(colors.red('Exiting due to unsatisfied dependencies!'))
    process.exit(1)
  }
}

module.exports = validateDependencies
