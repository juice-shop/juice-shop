const process = require('process')
const config = require('config')

const specialProducts = [
  { name: 'Christmas Challenge Product', key: 'useForChristmasSpecialChallenge' },
  { name: 'Product Tampering Challenge Product', key: 'urlForProductTamperingChallenge' },
  { name: 'Blueprint File Retrieval Product', key: 'fileForRetrieveBlueprintChallenge' }
]

const validateConfig = ({ products = config.get('products'), exitOnFailure = true } = {}) => {
  try {
    checkThatThereIsOnlyOneProductPerSpecial(products)
    checkThatProductArentUsedAsMultipleSpecialProducts(products)
  } catch (err) {
    console.error(err.message)
    console.error()
    console.error('The application will exit because of an error in the config. Check the lines above for more information.')

    if (exitOnFailure) {
      process.exit(1)
    }
    return false
  }
  return true
}

const checkThatThereIsOnlyOneProductPerSpecial = (products) => {
  return specialProducts.every(({ name, key }) => {
    const matchingProducts = products.filter((product) => product[key])

    if (matchingProducts.length === 0) {
      throw new Error(`At least one Product should be configured as a ${name}`)
    } else if (matchingProducts.length > 1) {
      throw new Error(`There are multiple products configured as the ${name}. Only one product should be used for the challenge.`)
    }
    return true
  })
}

const checkThatProductArentUsedAsMultipleSpecialProducts = (products) => {
  return products.every(
    (product) => {
      const appliedSpeicals = specialProducts.filter(({ key }) => product[key])

      if (appliedSpeicals.length > 1) {
        throw new Error(`You cannot use the Product ${product.name} for multiple Challenges.\nIt was attempted to be used as ${appliedSpeicals.map(({ name }) => name).join(' and ')}`)
      }
      return true
    }
  )
}

validateConfig.checkThatThereIsOnlyOneProductPerSpecial = checkThatThereIsOnlyOneProductPerSpecial
validateConfig.checkThatProductArentUsedAsMultipleSpecialProducts = checkThatProductArentUsedAsMultipleSpecialProducts

module.exports = validateConfig
