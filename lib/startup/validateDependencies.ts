/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import colors from 'colors/safe'
import * as utils from '../utils'
import logger from '../logger'
// @ts-expect-error FIXME due to non-existing type definitions for check-dependencies
import dependencyChecker from 'check-dependencies'

const validateDependencies = async ({ packageDir = '.' } = {}) => {
  let dependencies: any = {}
  try {
    dependencies = await dependencyChecker({ packageDir, scopeList: ['dependencies'] })
  } catch (err) {
    logger.warn(`Dependencies in ${colors.bold(packageDir + '/package.json')} could not be checked due to "${utils.getErrorMessage(err)}" error (${colors.red('ERROR')})`)
  }

  if (dependencies.depsWereOk === true) {
    logger.info(`All dependencies in ${colors.bold(packageDir + '/package.json')} are satisfied (${colors.green('SUCCESS')})`)
    return true
  } else {
    logger.warn(`Dependencies in ${colors.bold(packageDir + '/package.json')} are not rightly satisfied (${colors.red('ERROR')})`)
    for (const err of dependencies.error) {
      logger.warn(err)
    }
    return false
  }
}

export default validateDependencies
