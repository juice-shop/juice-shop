/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import colors from 'colors/safe'
import * as utils from '../utils'
import logger from '../logger'
// @ts-expect-error FIXME due to non-existing type definitions for check-dependencies
import dependencyChecker from 'check-dependencies'

const validateDependencies = async ({ packageDir = '.', exitOnFailure = true } = {}) => {
  let success = true
  let dependencies: any = {}
  try {
    dependencies = await dependencyChecker({ packageDir, scopeList: ['dependencies'] })
  } catch (err) {
    logger.warn(`Dependencies in ${colors.bold(packageDir + '/package.json')} could not be checked due to "${utils.getErrorMessage(err)}" error (${colors.red('NOT OK')})`)
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

export default validateDependencies
