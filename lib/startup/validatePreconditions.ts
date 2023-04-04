/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import pjson from '../../package.json'
import config = require('config')
const process = require('process')
const semver = require('semver')
const colors = require('colors/safe')
const logger = require('../logger')
const portscanner = require('portscanner')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const access = promisify(fs.access)

const validatePreconditions = async ({ exitOnFailure = true } = {}) => {
  let success = true
  success = checkIfRunningOnSupportedNodeVersion(process.version) && success
  success = checkIfRunningOnSupportedOS(process.platform) && success
  success = checkIfRunningOnSupportedCPU(process.arch) && success

  const asyncConditions = (await Promise.all([
    checkIfRequiredFileExists('build/server.js'),
    checkIfRequiredFileExists('frontend/dist/frontend/index.html'),
    checkIfRequiredFileExists('frontend/dist/frontend/styles.css'),
    checkIfRequiredFileExists('frontend/dist/frontend/main.js'),
    checkIfRequiredFileExists('frontend/dist/frontend/tutorial.js'),
    checkIfRequiredFileExists('frontend/dist/frontend/polyfills.js'),
    checkIfRequiredFileExists('frontend/dist/frontend/runtime.js'),
    checkIfRequiredFileExists('frontend/dist/frontend/vendor.js'),
    checkIfPortIsAvailable(process.env.PORT || config.get('server.port'))
  ])).every(condition => condition)

  if ((!success || !asyncConditions) && exitOnFailure) {
    logger.error(colors.red('Exiting due to unsatisfied precondition!'))
    process.exit(1)
  }
  return success
}

const checkIfRunningOnSupportedNodeVersion = (runningVersion: string) => {
  const supportedVersion = pjson.engines.node
  const effectiveVersionRange = semver.validRange(supportedVersion)
  if (!semver.satisfies(runningVersion, effectiveVersionRange)) {
    logger.warn(`Detected Node version ${colors.bold(runningVersion)} is not in the supported version range of ${supportedVersion} (${colors.red('NOT OK')})`)
    return false
  }
  logger.info(`Detected Node.js version ${colors.bold(runningVersion)} (${colors.green('OK')})`)
  return true
}

const checkIfRunningOnSupportedOS = (runningOS: string) => {
  const supportedOS = pjson.os
  if (!supportedOS.includes(runningOS)) {
    logger.warn(`Detected OS ${colors.bold(runningOS)} is not in the list of supported platforms ${supportedOS} (${colors.red('NOT OK')})`)
    return false
  }
  logger.info(`Detected OS ${colors.bold(runningOS)} (${colors.green('OK')})`)
  return true
}

const checkIfRunningOnSupportedCPU = (runningArch: string) => {
  const supportedArch = pjson.cpu
  if (!supportedArch.includes(runningArch)) {
    logger.warn(`Detected CPU ${colors.bold(runningArch)} is not in the list of supported architectures ${supportedArch} (${colors.red('NOT OK')})`)
    return false
  }
  logger.info(`Detected CPU ${colors.bold(runningArch)} (${colors.green('OK')})`)
  return true
}

const checkIfPortIsAvailable = async (port: number) => {
  return await new Promise((resolve, reject) => {
    portscanner.checkPortStatus(port, function (error: unknown, status: string) {
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

const checkIfRequiredFileExists = async (pathRelativeToProjectRoot: string) => {
  const fileName = pathRelativeToProjectRoot.substr(pathRelativeToProjectRoot.lastIndexOf('/') + 1)

  return access(path.resolve(pathRelativeToProjectRoot)).then(() => {
    logger.info(`Required file ${colors.bold(fileName)} is present (${colors.green('OK')})`)
    return true
  }).catch(() => {
    logger.warn(`Required file ${colors.bold(fileName)} is missing (${colors.red('NOT OK')})`)
    return false
  })
}

validatePreconditions.checkIfRunningOnSupportedNodeVersion = checkIfRunningOnSupportedNodeVersion
validatePreconditions.checkIfPortIsAvailable = checkIfPortIsAvailable
validatePreconditions.checkIfRequiredFileExists = checkIfRequiredFileExists

module.exports = validatePreconditions
