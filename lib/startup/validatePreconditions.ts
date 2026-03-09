/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import pjson from '../../package.json'
import config from 'config'
import logger from '../logger'
import path from 'node:path'
import colors from 'colors/safe'
import { access, readdir } from 'node:fs/promises'
import process from 'node:process'
import semver from 'semver'
import portscanner from 'portscanner'
// @ts-expect-error FIXME due to non-existing type definitions for check-internet-connected
import checkInternetConnected from 'check-internet-connected'

export const variableDependencies = {
  ALCHEMY_API_KEY: ['"Mint the Honey Pot" challenge', '"Wallet Depletion" challenge']
}

export const domainDependencies = {
  'https://www.alchemy.com/': ['"Mint the Honey Pot" challenge', '"Wallet Depletion" challenge']
}

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
    checkIfRequiredFileExists('frontend/dist/frontend/polyfills.js'),
    checkIfRequiredFilePatternExists('frontend/dist/frontend', /^hacking-instructor-.+\.js$/),
    checkIfPortIsAvailable(process.env.PORT ?? config.get<number>('server.port')),
    checkIfDomainReachable('https://www.alchemy.com/'),
    checkIfEnvironmentVariableExists('ALCHEMY_API_KEY'),
    checkIfLlmApiReachable()
  ])).every(condition => condition)

  if ((!success || !asyncConditions) && exitOnFailure) {
    logger.error(colors.red('Exiting due to unsatisfied precondition!'))
    process.exit(1)
  }
  return success
}

export const checkIfRunningOnSupportedNodeVersion = (runningVersion: string) => {
  const supportedVersion = pjson.engines.node
  const effectiveVersionRange = semver.validRange(supportedVersion)
  if (!effectiveVersionRange) {
    logger.warn(`Invalid Node.js version range ${colors.bold(supportedVersion)} in package.json (${colors.red('NOT OK')})`)
    return false
  }
  if (!semver.satisfies(runningVersion, effectiveVersionRange)) {
    logger.warn(`Detected Node version ${colors.bold(runningVersion)} is not in the supported version range of ${supportedVersion} (${colors.red('NOT OK')})`)
    return false
  }
  logger.info(`Detected Node.js version ${colors.bold(runningVersion)} (${colors.green('OK')})`)
  return true
}

export const checkIfRunningOnSupportedOS = (runningOS: string) => {
  const supportedOS = pjson.os
  if (!supportedOS.includes(runningOS)) {
    logger.warn(`Detected OS ${colors.bold(runningOS)} is not in the list of supported platforms ${supportedOS.toString()} (${colors.red('NOT OK')})`)
    return false
  }
  logger.info(`Detected OS ${colors.bold(runningOS)} (${colors.green('OK')})`)
  return true
}

export const checkIfRunningOnSupportedCPU = (runningArch: string) => {
  const supportedArch = pjson.cpu
  if (!supportedArch.includes(runningArch)) {
    logger.warn(`Detected CPU ${colors.bold(runningArch)} is not in the list of supported architectures ${supportedArch.toString()} (${colors.red('NOT OK')})`)
    return false
  }
  logger.info(`Detected CPU ${colors.bold(runningArch)} (${colors.green('OK')})`)
  return true
}

export const checkIfEnvironmentVariableExists = (varName: string) => {
  if (process.env[varName]) {
    logger.info(`Environment variable ${colors.bold(varName)} is present (${colors.green('OK')})`)
    return true
  }
  logger.warn(`Environment variable ${colors.bold(varName)} is not present (${colors.yellow('NOT OK')})`)
  // @ts-expect-error FIXME Type problem by accessing key via variable
  if (variableDependencies[varName]) {
    // @ts-expect-error FIXME Type problem by accessing key via variable
    variableDependencies[varName].forEach((dependency: string) => {
      logger.warn(`${colors.italic(dependency)} will not work as intended without a valid ${colors.bold(varName)}`)
    })
  }
  return true
}

export const checkIfDomainReachable = async (domain: string) => {
  return checkInternetConnected({ domain })
    .then(() => {
      logger.info(`Domain ${colors.bold(domain)} is reachable (${colors.green('OK')})`)
      return true
    })
    .catch(() => {
      logger.warn(`Domain ${colors.bold(domain)} is not reachable (${colors.yellow('NOT OK')})`)
      // @ts-expect-error FIXME Type problem by accessing key via variable
      domainDependencies[domain].forEach((dependency: string) => {
        logger.warn(`${colors.italic(dependency)} will not work as intended without access to ${colors.bold(domain)}`)
      })
      return true // TODO Consider switching to "false" with breaking release v16.0.0 or later
    })
}

export const checkIfPortIsAvailable = async (port: number | string) => {
  const portNumber = parseInt(port.toString())
  return await new Promise((resolve, reject) => {
    portscanner.checkPortStatus(portNumber, function (error: unknown, status: string) {
      if (error) {
        reject(error)
      } else {
        if (status === 'open') {
          logger.warn(`Port ${colors.bold(port.toString())} is in use (${colors.red('NOT OK')})`)
          resolve(false)
        } else {
          logger.info(`Port ${colors.bold(port.toString())} is available (${colors.green('OK')})`)
          resolve(true)
        }
      }
    })
  })
}

export const checkIfRequiredFileExists = async (pathRelativeToProjectRoot: string) => {
  const fileName = pathRelativeToProjectRoot.substr(pathRelativeToProjectRoot.lastIndexOf('/') + 1)

  return await access(path.resolve(pathRelativeToProjectRoot)).then(() => {
    logger.info(`Required file ${colors.bold(fileName)} is present (${colors.green('OK')})`)
    return true
  }).catch(() => {
    logger.warn(`Required file ${colors.bold(fileName)} is missing (${colors.red('NOT OK')})`)
    return false
  })
}

export const checkIfRequiredFilePatternExists = async (directory: string, pattern: RegExp) => {
  try {
    const files = await readdir(path.resolve(directory))
    const match = files.find(file => pattern.test(file))
    if (match) {
      logger.info(`Required file matching ${colors.bold(String(pattern))} is present (${colors.green('OK')})`)
      return true
    }
    logger.warn(`Required file matching ${colors.bold(String(pattern))} is missing (${colors.red('NOT OK')})`)
    return false
  } catch {
    logger.warn(`Required file matching ${colors.bold(String(pattern))} is missing (${colors.red('NOT OK')})`)
    return false
  }
}

export const isOllamaUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return parsed.port === '11434' || parsed.hostname === 'ollama' || parsed.pathname.startsWith('/ollama')
  } catch {
    return false
  }
}

export const checkIfLlmApiReachable = async () => {
  const llmApiUrl = config.get<string>('application.chatBot.llmApiUrl')
  try {
    const response = await fetch(`${llmApiUrl}/models`, { signal: AbortSignal.timeout(5000) })
    if (response.ok) {
      logger.info(`LLM API at ${colors.bold(llmApiUrl)} is reachable (${colors.green('OK')})`)
      if (isOllamaUrl(llmApiUrl)) {
        await checkIfOllamaModelAvailable(llmApiUrl)
      }
    } else {
      logger.warn(`LLM API at ${colors.bold(llmApiUrl)} returned status ${response.status} (${colors.yellow('NOT OK')})`)
      logLlmChallengeWarnings()
    }
  } catch {
    logger.warn(`LLM API at ${colors.bold(llmApiUrl)} is not reachable (${colors.yellow('NOT OK')})`)
    logLlmChallengeWarnings()
  }
  return true
}

export const checkIfOllamaModelAvailable = async (llmApiUrl: string) => {
  const model = config.get<string>('application.chatBot.model')
  try {
    const response = await fetch(`${llmApiUrl}/models`, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) return
    const body = await response.json() as { data?: Array<{ id: string }> }
    const availableModels: string[] = (body.data ?? []).map((m: { id: string }) => m.id)
    const modelFound = availableModels.some(
      (available) => available === model || available.startsWith(`${model}:`) || model.startsWith(`${available}:`)
    )
    if (modelFound) {
      logger.info(`Ollama model ${colors.bold(model)} is available (${colors.green('OK')})`)
    } else {
      logger.warn(`Ollama model ${colors.bold(model)} is not available (${colors.yellow('NOT OK')})`)
      let pullModelMessage = `Pull the model with: ${colors.bold(`ollama pull ${model}`)}`
      if (availableModels.length > 0) {
        pullModelMessage += ` or configure an available model: ${colors.bold(availableModels.join(', '))}`
      }
      logger.warn(pullModelMessage)
      logLlmChallengeWarnings()
    }
  } catch {
    logger.warn(`Could not verify Ollama model ${colors.bold(model)} availability (${colors.yellow('NOT OK')})`)
  }
}

const logLlmChallengeWarnings = () => {
  logger.warn(`${colors.italic('"Chatbot Prompt Injection" challenge')} will not work without a running LLM API`)
  logger.warn(`${colors.italic('"Greedy Chatbot Manipulation" challenge')} will not work without a running LLM API`)
  logger.warn(`Check ${colors.bold('https://howto-llm.owasp-juice.shop')} for instructions on how to set up and configure the LLM API`)
}

export default validatePreconditions
