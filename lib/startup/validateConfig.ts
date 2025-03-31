/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import config from 'config'
import process from 'node:process'
import colors from 'colors/safe'
// @ts-expect-error FIXME due to non-existing type definitions for yaml-schema-validator
import validateSchema from 'yaml-schema-validator/src'

import type { AppConfig, Memory as MemoryConfig, Product as ProductConfig } from '../config.types'
import logger from '../logger'

const specialProducts = [
  { name: '"Christmas Special" challenge product', key: 'useForChristmasSpecialChallenge' },
  { name: '"Product Tampering" challenge product', key: 'urlForProductTamperingChallenge' },
  { name: '"Retrieve Blueprint" challenge product', key: 'fileForRetrieveBlueprintChallenge', extra: { key: 'exifForBlueprintChallenge', name: 'list of EXIF metadata properties' } },
  { name: '"Leaked Unsafe Product" challenge product', key: 'keywordsForPastebinDataLeakChallenge' }
]

const specialMemories = [
  { name: '"Meta Geo Stalking" challenge memory', user: 'john', keys: ['geoStalkingMetaSecurityQuestion', 'geoStalkingMetaSecurityAnswer'] },
  { name: '"Visual Geo Stalking" challenge memory', user: 'emma', keys: ['geoStalkingVisualSecurityQuestion', 'geoStalkingVisualSecurityAnswer'] }
] as const

const validateConfig = async ({ products, memories, exitOnFailure = true }: { products?: ProductConfig[], memories?: MemoryConfig[], exitOnFailure: boolean }) => {
  products = products ?? config.get('products') ?? []
  memories = memories ?? config.get('memories') ?? []

  let success = true
  success = checkYamlSchema() && success
  success = checkMinimumRequiredNumberOfProducts(products) && success
  success = checkUnambiguousMandatorySpecialProducts(products) && success
  success = checkUniqueSpecialOnProducts(products) && success
  success = checkNecessaryExtraKeysOnSpecialProducts(products) && success
  success = checkMinimumRequiredNumberOfMemories(memories) && success
  success = checkUnambiguousMandatorySpecialMemories(memories) && success
  success = checkUniqueSpecialOnMemories(memories) && success
  success = checkSpecialMemoriesHaveNoUserAssociated(memories) && success
  success = checkForIllogicalCombos() && success
  if (success) {
    logger.info(`Configuration ${colors.bold(process.env.NODE_ENV ?? 'default')} validated (${colors.green('OK')})`)
  } else {
    logger.warn(`Configuration ${colors.bold(process.env.NODE_ENV ?? 'default')} validated (${colors.red('NOT OK')})`)
    logger.warn(`Visit ${colors.yellow('https://pwning.owasp-juice.shop/companion-guide/latest/part4/customization.html#_yaml_configuration_file')} for the configuration schema definition.`)
    if (exitOnFailure) {
      logger.error(colors.red('Exiting due to configuration errors!'))
      process.exit(1)
    }
  }
  return success
}

export const checkYamlSchema = (configuration = config.util.toObject()): configuration is AppConfig => {
  let success = true
  const schemaErrors = validateSchema(configuration, { schemaPath: path.resolve('config.schema.yml'), logLevel: 'none' })
  if (schemaErrors.length !== 0) {
    logger.warn(`Config schema validation failed with ${schemaErrors.length} errors (${colors.red('NOT OK')})`)
    schemaErrors.forEach(({ path, message }: { path: string, message: string }) => {
      logger.warn(`${path}:${colors.red(message.substr(message.indexOf(path) + path.length))}`)
    })
    success = false
  }
  return success
}

export const checkMinimumRequiredNumberOfProducts = (products: ProductConfig[]) => {
  let success = true
  if (products.length < 4) {
    logger.warn(`Only ${products.length} products are configured but at least four are required (${colors.red('NOT OK')})`)
    success = false
  }
  return success
}

export const checkUnambiguousMandatorySpecialProducts = (products: ProductConfig[]) => {
  let success = true
  specialProducts.forEach(({ name, key }) => {
    // @ts-expect-error FIXME Ignoring any type issue on purpose
    const matchingProducts = products.filter((product) => product[key])
    if (matchingProducts.length === 0) {
      logger.warn(`No product is configured as ${colors.italic(name)} but one is required (${colors.red('NOT OK')})`)
      success = false
    } else if (matchingProducts.length > 1) {
      logger.warn(`${matchingProducts.length} products are configured as ${colors.italic(name)} but only one is allowed (${colors.red('NOT OK')})`)
      success = false
    }
  })
  return success
}

export const checkNecessaryExtraKeysOnSpecialProducts = (products: ProductConfig[]) => {
  let success = true
  specialProducts.forEach(({ name, key, extra = {} }) => {
    // @ts-expect-error FIXME implicit any type issue
    const matchingProducts = products.filter((product) => product[key])
    // @ts-expect-error FIXME implicit any type issue
    if (extra.key && matchingProducts.length === 1 && !matchingProducts[0][extra.key]) {
      logger.warn(`Product ${colors.italic(matchingProducts[0].name)} configured as ${colors.italic(name)} does't contain necessary ${colors.italic(`${extra.name}`)} (${colors.red('NOT OK')})`)
      success = false
    }
  })
  return success
}

export const checkUniqueSpecialOnProducts = (products: ProductConfig[]) => {
  let success = true
  products.forEach((product) => {
    // @ts-expect-error FIXME any type issue
    const appliedSpecials = specialProducts.filter(({ key }) => product[key])
    if (appliedSpecials.length > 1) {
      logger.warn(`Product ${colors.italic(product.name)} is used as ${appliedSpecials.map(({ name }) => `${colors.italic(name)}`).join(' and ')} but can only be used for one challenge (${colors.red('NOT OK')})`)
      success = false
    }
  })
  return success
}

export const checkMinimumRequiredNumberOfMemories = (memories: MemoryConfig[]) => {
  let success = true
  if (memories.length < 2) {
    logger.warn(`Only ${memories.length} memories are configured but at least two are required (${colors.red('NOT OK')})`)
    success = false
  }
  return success
}

export const checkUnambiguousMandatorySpecialMemories = (memories: MemoryConfig[]) => {
  let success = true
  specialMemories.forEach(({ name, keys }) => {
    const matchingMemories = memories.filter((memory) => memory[keys[0]] && memory[keys[1]])
    if (matchingMemories.length === 0) {
      logger.warn(`No memory is configured as ${colors.italic(name)} but one is required (${colors.red('NOT OK')})`)
      success = false
    } else if (matchingMemories.length > 1) {
      logger.warn(`${matchingMemories.length} memories are configured as ${colors.italic(name)} but only one is allowed (${colors.red('NOT OK')})`)
      success = false
    }
  })
  return success
}

export const checkSpecialMemoriesHaveNoUserAssociated = (memories: MemoryConfig[]) => {
  let success = true
  specialMemories.forEach(({ name, user, keys }) => {
    const matchingMemories = memories.filter((memory) => memory[keys[0]] && memory[keys[1]] && memory.user && memory.user !== user)
    if (matchingMemories.length > 0) {
      logger.warn(`Memory configured as ${colors.italic(name)} must belong to user ${colors.italic(user)} but was linked to ${colors.italic(matchingMemories[0].user ?? 'unknown')} user (${colors.red('NOT OK')})`)
      success = false
    }
  })
  return success
}

export const checkUniqueSpecialOnMemories = (memories: MemoryConfig[]) => {
  let success = true
  memories.forEach((memory) => {
    const appliedSpecials = specialMemories.filter(({ keys }) => memory[keys[0]] && memory[keys[1]])
    if (appliedSpecials.length > 1) {
      logger.warn(`Memory ${colors.italic(memory.caption)} is used as ${appliedSpecials.map(({ name }) => `${colors.italic(name)}`).join(' and ')} but can only be used for one challenge (${colors.red('NOT OK')})`)
      success = false
    }
  })
  return success
}

export const checkForIllogicalCombos = (configuration = config.util.toObject()) => {
  let success = true
  if (configuration.challenges.restrictToTutorialsFirst && !configuration.hackingInstructor.isEnabled) {
    logger.warn(`Restricted tutorial mode is enabled while Hacking Instructor is disabled (${colors.red('NOT OK')})`)
    success = false
  }
  if (configuration.ctf.showFlagsInNotifications && !configuration.challenges.showSolvedNotifications) {
    logger.warn(`CTF flags are enabled while challenge solved notifications are disabled (${colors.red('NOT OK')})`)
    success = false
  }
  if (['name', 'flag', 'both'].includes(configuration.ctf.showCountryDetailsInNotifications) && !configuration.ctf.showFlagsInNotifications) {
    logger.warn(`CTF country mappings for FBCTF are enabled while CTF flags are disabled (${colors.red('NOT OK')})`)
    success = false
  }
  return success
}

export default validateConfig
