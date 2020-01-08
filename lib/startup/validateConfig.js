const process = require('process')
const config = require('config')
const colors = require('colors/safe')
const logger = require('../logger')
const path = require('path')
const validateSchema = require('yaml-schema-validator')

const specialProducts = [
  { name: 'Christmas Challenge Product', key: 'useForChristmasSpecialChallenge' },
  { name: 'Product Tampering Challenge Product', key: 'urlForProductTamperingChallenge' },
  { name: 'Blueprint File Retrieval Product', key: 'fileForRetrieveBlueprintChallenge' },
  { name: 'Pastebin Leak Challenge Product', key: 'keywordsForPastebinDataLeakChallenge' }
]

const validateConfig = ({ products = config.get('products'), exitOnFailure = true } = {}) => {
  let success = true
  success = checkSchema() && success
  success = checkIfOnlyOneProductPerSpecial(products) && success
  success = checkIfProductsNotUsedAsMultipleSpecials(products) && success
  if (success) {
    logger.info(`Configuration ${colors.bold(process.env.NODE_ENV || 'default')} validated (${colors.green('OK')})`)
  } else {
    logger.warn(`Configuration ${colors.bold(process.env.NODE_ENV || 'default')} validated (${colors.red('NOT OK')})`)
    if (exitOnFailure) {
      logger.error(colors.red('Exiting due to configuration errors!'))
      process.exit(1)
    }
  }
  return success
}

const checkSchema = (configuration = config.util.toObject()) => {
  let success = true
  const schemaErrors = validateSchema(configuration, { schemaPath: path.resolve(__dirname, '../../config.schema.yml'), logLevel: 'none' })
  if (schemaErrors.length !== 0) {
    logger.warn(`Config schema validation failed with ${schemaErrors.length} errors (${colors.red('NOT OK')})`)
    schemaErrors.forEach(({ path, message }) => {
      logger.warn(`${path}:${colors.red(message.substr(message.indexOf(path) + path.length))}`)
    })
    logger.warn(`Visit ${colors.yellow('https://pwning.owasp-juice.shop/part1/customization.html#yaml-configuration-file')} for the schema definition`)
    success = false
  }
  return success
}

const checkIfOnlyOneProductPerSpecial = (products) => {
  let success = true
  specialProducts.forEach(({ name, key }) => {
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

const checkIfProductsNotUsedAsMultipleSpecials = (products) => {
  let success = true
  products.forEach((product) => {
    const appliedSpeicals = specialProducts.filter(({ key }) => product[key])
    if (appliedSpeicals.length > 1) {
      logger.warn(`Product ${colors.italic(product.name)} is used as ${appliedSpeicals.map(({ name }) => `${colors.italic(name)}`).join(' and ')} but can only be used for one challenge (${colors.red('NOT OK')})`)
      success = false
    }
  })
  return success
}

validateConfig.checkThatThereIsOnlyOneProductPerSpecial = checkIfOnlyOneProductPerSpecial
validateConfig.checkThatProductArentUsedAsMultipleSpecialProducts = checkIfProductsNotUsedAsMultipleSpecials
validateConfig.checkSchema = checkSchema

module.exports = validateConfig
