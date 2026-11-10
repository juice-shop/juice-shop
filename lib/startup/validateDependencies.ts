/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import { readFile } from 'node:fs/promises'
import semver from 'semver'
import colors from '../colors'
import * as utils from '../utils'
import logger from '../logger'

const findDependencyErrors = async (packageDir: string) => {
  const errors: string[] = []
  const { dependencies = {} } = JSON.parse(await readFile(path.join(packageDir, 'package.json'), 'utf8'))
  for (const [name, range] of Object.entries<string>(dependencies)) {
    let installedVersion: string
    try {
      installedVersion = JSON.parse(await readFile(path.join(packageDir, 'node_modules', name, 'package.json'), 'utf8')).version
    } catch {
      errors.push(`${name}: not installed!`)
      continue
    }
    if (semver.validRange(range) && !semver.satisfies(installedVersion, range, { includePrerelease: true })) {
      errors.push(`${name}: installed: ${installedVersion}, expected: ${range}`)
    }
  }
  return errors
}

const validateDependencies = async ({ packageDir = '.' } = {}) => {
  let errors: string[]
  try {
    errors = await findDependencyErrors(packageDir)
  } catch (err) {
    logger.warn(`Dependencies in ${colors.bold(packageDir + '/package.json')} could not be checked due to "${utils.getErrorMessage(err)}" error (${colors.red('ERROR')})`)
    logger.warn(`Dependencies in ${colors.bold(packageDir + '/package.json')} are not rightly satisfied (${colors.red('ERROR')})`)
    return false
  }

  if (errors.length === 0) {
    logger.info(`All dependencies in ${colors.bold(packageDir + '/package.json')} are satisfied (${colors.green('SUCCESS')})`)
    return true
  } else {
    logger.warn(`Dependencies in ${colors.bold(packageDir + '/package.json')} are not rightly satisfied (${colors.red('ERROR')})`)
    for (const err of errors) {
      logger.warn(err)
    }
    return false
  }
}

export default validateDependencies
