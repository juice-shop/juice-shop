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
import validateDependencies from './validateDependencies'

export interface Dependency {
  dependency: string
  documentation: string
  dependentChallenges: string[]
  missing?: boolean
}

export const variableDependencies: Record<string, Dependency> = {
  ALCHEMY_API_KEY: {
    dependency: 'Alchemy API Key',
    documentation: 'https://howto-web3.owasp-juice.shop',
    dependentChallenges: ['"Mint the Honey Pot" challenge', '"Wallet Depletion" challenge']
  }
}

export const domainDependencies: Record<string, Dependency> = {
  'https://www.alchemy.com/': {
    dependency: 'Alchemy API',
    documentation: 'https://howto-web3.owasp-juice.shop',
    dependentChallenges: ['"Mint the Honey Pot" challenge', '"Wallet Depletion" challenge']
  },
  [config.get<string>('application.chatBot.llmApiUrl')]: {
    dependency: 'LLM API',
    documentation: 'https://howto-llm.owasp-juice.shop',
    dependentChallenges: ['"Chatbot Prompt Injection" challenge', '"Greedy Chatbot Manipulation" challenge', '"AI Debugging" challenge']
  }
}

export const preconditionResults: Record<string, boolean> = {}

let resolvePreconditionsReady: () => void
export const preconditionsReady = new Promise<void>((resolve) => {
  resolvePreconditionsReady = resolve
})

const validatePreconditions = async ({ exitOnFailure = true } = {}) => {
  let success = true
  success = checkIfRunningOnSupportedNodeVersion(process.version) && success
  success = checkIfRunningOnSupportedOS(process.platform) && success
  success = checkIfRunningOnSupportedCPU(process.arch) && success

  const asyncResults = await Promise.all([
    validateDependencies(),
    checkIfRequiredFileExists('build/server.js'),
    checkIfRequiredFileExists('frontend/dist/frontend/index.html'),
    checkIfRequiredFileExists('frontend/dist/frontend/styles.css'),
    checkIfRequiredFileExists('frontend/dist/frontend/main.js'),
    checkIfRequiredFileExists('frontend/dist/frontend/polyfills.js'),
    checkIfRequiredFilePatternExists('frontend/dist/frontend', /^hacking-instructor-.+\.js$/),
    checkIfPortIsAvailable(process.env.PORT ?? config.get<number>('server.port'))
  ])
  const asyncConditions = asyncResults.every(condition => condition)

  const alchemyDomainReachable = await checkIfDomainReachable('https://www.alchemy.com/')
  const alchemyEnvVarExists = checkIfEnvironmentVariableExists('ALCHEMY_API_KEY')
  preconditionResults['https://www.alchemy.com/'] = alchemyDomainReachable
  preconditionResults.ALCHEMY_API_KEY = alchemyEnvVarExists
  if (!alchemyDomainReachable || !alchemyEnvVarExists) {
    logger.info(`Check ${colors.bold('https://howto-web3.owasp-juice.shop')} for instructions on how to set up and configure the Alchemy API`)
  }
  const llmApiUrl = config.get<string>('application.chatBot.llmApiUrl')
  const llmApiReachable = await checkIfDomainReachable(llmApiUrl)
  let llmApiKeyEnvVarExists = true
  let llmModelAvailable = true
  preconditionResults[llmApiUrl] = llmApiReachable
  if (llmApiReachable) {
    const llmModel = config.get<string>('application.chatBot.model')
    llmModelAvailable = await checkIfLlmModelAvailable(llmApiUrl)
    variableDependencies[llmModel] = {
      dependency: 'LLM Model',
      documentation: 'https://howto-llm.owasp-juice.shop',
      dependentChallenges: ['"Chatbot Prompt Injection" challenge', '"Greedy Chatbot Manipulation" challenge', '"AI Debugging" challenge']
    }
    preconditionResults[llmModel] = llmModelAvailable
    if (!isOllamaUrl(llmApiUrl)) {
      variableDependencies.LLM_API_KEY = {
        dependency: 'LLM API Key',
        documentation: 'https://howto-llm.owasp-juice.shop',
        dependentChallenges: ['"Chatbot Prompt Injection" challenge', '"Greedy Chatbot Manipulation" challenge', '"AI Debugging" challenge']
      }
      llmApiKeyEnvVarExists = checkIfEnvironmentVariableExists('LLM_API_KEY')
      preconditionResults.LLM_API_KEY = llmApiKeyEnvVarExists
    }
  }
  if (!llmApiReachable || !llmApiKeyEnvVarExists || !llmModelAvailable) {
    logger.info(`Check ${colors.bold('https://howto-llm.owasp-juice.shop')} for instructions on how to set up and configure the LLM API`)
  }

  resolvePreconditionsReady()

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
    logger.warn(`Invalid Node.js version range ${colors.bold(supportedVersion)} in package.json (${colors.red('ERROR')})`)
    return false
  }
  if (!semver.satisfies(runningVersion, effectiveVersionRange)) {
    logger.warn(`Detected Node version ${colors.bold(runningVersion)} is not in the supported version range of ${supportedVersion} (${colors.red('ERROR')})`)
    return false
  }
  logger.info(`Detected Node.js version ${colors.bold(runningVersion)} (${colors.green('SUCCESS')})`)
  return true
}

export const checkIfRunningOnSupportedOS = (runningOS: string) => {
  const supportedOS = pjson.os
  if (!supportedOS.includes(runningOS)) {
    logger.warn(`Detected OS ${colors.bold(runningOS)} is not in the list of supported platforms ${supportedOS.toString()} (${colors.red('ERROR')})`)
    return false
  }
  logger.info(`Detected OS ${colors.bold(runningOS)} (${colors.green('SUCCESS')})`)
  return true
}

export const checkIfRunningOnSupportedCPU = (runningArch: string) => {
  const supportedArch = pjson.cpu
  if (!supportedArch.includes(runningArch)) {
    logger.warn(`Detected CPU ${colors.bold(runningArch)} is not in the list of supported architectures ${supportedArch.toString()} (${colors.red('ERROR')})`)
    return false
  }
  logger.info(`Detected CPU ${colors.bold(runningArch)} (${colors.green('SUCCESS')})`)
  return true
}

export const checkIfEnvironmentVariableExists = (varName: string) => {
  if (process.env[varName]) {
    logger.info(`Environment variable ${colors.bold(varName)} is present (${colors.green('SUCCESS')})`)
    return true
  }
  logger.warn(`Environment variable ${colors.bold(varName)} is not present (${colors.yellow('WARNING')})`)
  if (variableDependencies[varName]) {
    variableDependencies[varName].dependentChallenges.forEach((dependency: string) => {
      logger.warn(`${colors.italic(dependency)} will not work as intended without a valid ${colors.bold(varName)}`)
    })
  }
  return false
}

export const checkIfDomainReachable = async (domain: string) => {
  try {
    await fetch(domain, { signal: AbortSignal.timeout(5000) })
    logger.info(`Domain ${colors.bold(domain)} is reachable (${colors.green('SUCCESS')})`)
    return true
  } catch {
    logger.warn(`Domain ${colors.bold(domain)} is not reachable (${colors.yellow('WARNING')})`)
    domainDependencies[domain].dependentChallenges.forEach((dependency: string) => {
      logger.warn(`${colors.italic(dependency)} will not work as intended without access to ${colors.bold(domain)}`)
    })
    return false
  }
}

export const checkIfPortIsAvailable = async (port: number | string) => {
  const portNumber = parseInt(port.toString())
  return await new Promise((resolve, reject) => {
    portscanner.checkPortStatus(portNumber, function (error: unknown, status: string) {
      if (error) {
        reject(error)
      } else {
        if (status === 'open') {
          logger.warn(`Port ${colors.bold(port.toString())} is in use (${colors.red('ERROR')})`)
          resolve(false)
        } else {
          logger.info(`Port ${colors.bold(port.toString())} is available (${colors.green('SUCCESS')})`)
          resolve(true)
        }
      }
    })
  })
}

export const checkIfRequiredFileExists = async (pathRelativeToProjectRoot: string) => {
  const fileName = pathRelativeToProjectRoot.substr(pathRelativeToProjectRoot.lastIndexOf('/') + 1)

  return await access(path.resolve(pathRelativeToProjectRoot)).then(() => {
    logger.info(`Required file ${colors.bold(fileName)} is present (${colors.green('SUCCESS')})`)
    return true
  }).catch(() => {
    logger.warn(`Required file ${colors.bold(fileName)} is missing (${colors.red('ERROR')})`)
    return false
  })
}

export const checkIfRequiredFilePatternExists = async (directory: string, pattern: RegExp) => {
  try {
    const files = await readdir(path.resolve(directory))
    const match = files.find(file => pattern.test(file))
    if (match) {
      logger.info(`Required file matching ${colors.bold(String(pattern))} is present (${colors.green('SUCCESS')})`)
      return true
    }
    logger.warn(`Required file matching ${colors.bold(String(pattern))} is missing (${colors.red('ERROR')})`)
    return false
  } catch {
    logger.warn(`Required file matching ${colors.bold(String(pattern))} is missing (${colors.red('ERROR')})`)
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

export const checkIfLlmModelAvailable = async (llmApiUrl: string) => {
  const model = config.get<string>('application.chatBot.model')
  try {
    const response = await fetch(`${llmApiUrl}/models`, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) return false
    const body = await response.json() as { data?: Array<{ id: string }> }
    const availableModels: string[] = (body.data ?? []).map((m: { id: string }) => m.id)
    const modelFound = availableModels.some(
      (available) => available === model || available.startsWith(`${model}:`) || model.startsWith(`${available}:`)
    )
    if (modelFound) {
      logger.info(`LLM model ${colors.bold(model)} is available (${colors.green('SUCCESS')})`)
      return true
    } else {
      logger.warn(`LLM model ${colors.bold(model)} is not available (${colors.yellow('WARNING')})`)
      if (isOllamaUrl(llmApiUrl)) {
        let pullModelMessage = `Pull the model with: ${colors.bold(`ollama pull ${model}`)}`
        if (availableModels.length > 0) {
          pullModelMessage += ` or configure an available model: ${colors.bold(availableModels.join(', '))}`
        }
        logger.info(pullModelMessage)
      }
      return false
    }
  } catch {
    logger.warn(`Could not verify LLM model ${colors.bold(model)} availability (${colors.yellow('WARNING')})`)
    return false
  }
}

export default validatePreconditions
