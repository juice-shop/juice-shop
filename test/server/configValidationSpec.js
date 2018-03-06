const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

const validateConfig = require('../../lib/validateConfig')
const { checkThatThereIsOnlyOneProductPerSpecial, checkThatProductArentUsedAsMultipleSpecialProducts } = require('../../lib/validateConfig')

describe('configValidation', () => {
  describe('checkThatThereIsOnlyOneProductPerSpecial', () => {
    it('should accept a valid config', () => {
      const products = [
        {
          name: 'Apple Juice',
          useForChristmasSpecialChallenge: true
        },
        {
          name: 'Orange Juice',
          urlForProductTamperingChallenge: 'foobar'
        },
        {
          name: 'Melon Juice',
          fileForRetrieveBlueprintChallenge: 'foobar'
        }
      ]

      expect(checkThatThereIsOnlyOneProductPerSpecial(products)).to.equal(true)
    })

    it('should throw an exeption if a multiple products are configured for the same challenge', () => {
      const products = [
        {
          name: 'Apple Juice',
          useForChristmasSpecialChallenge: true
        },
        {
          name: 'Melon Bike',
          useForChristmasSpecialChallenge: true
        },
        {
          name: 'Orange Juice',
          urlForProductTamperingChallenge: 'foobar'
        },
        {
          name: 'Melon Juice',
          fileForRetrieveBlueprintChallenge: 'foobar'
        }
      ]

      expect(() => checkThatThereIsOnlyOneProductPerSpecial(products)).to.throw('There are multiple products configured as the Chrismas Challenge Product. Only one product should be used for the challenge.')
    })

    it('should throw an exeption if a required challenge product is missing', () => {
      const products = [
        {
          name: 'Apple Juice',
          useForChristmasSpecialChallenge: true
        },
        {
          name: 'Orange Juice',
          urlForProductTamperingChallenge: 'foobar'
        }
      ]

      expect(() => checkThatThereIsOnlyOneProductPerSpecial(products)).to.throw('At least one Product should be configured as a Blueprint File Retrival Product')
    })
  })

  describe('checkThatThereIsOnlyOneProductPerSpecial', () => {
    it('should accept a valid config', () => {
      const products = [
        {
          name: 'Apple Juice',
          useForChristmasSpecialChallenge: true
        },
        {
          name: 'Orange Juice',
          urlForProductTamperingChallenge: 'foobar'
        },
        {
          name: 'Melon Juice',
          fileForRetrieveBlueprintChallenge: 'foobar'
        }
      ]

      expect(checkThatProductArentUsedAsMultipleSpecialProducts(products)).to.equal(true)
    })

    it('should throw if a product is configured for multiple challenges', () => {
      const products = [
        {
          name: 'Apple Juice',
          useForChristmasSpecialChallenge: true,
          urlForProductTamperingChallenge: 'foobar'
        }
      ]

      expect(() => checkThatProductArentUsedAsMultipleSpecialProducts(products)).to.throw('You cannot use the Product Apple Juice for multiple Challenges.\nIt was attempted to be used as Chrismas Challenge Product and Product Tampering Challenge Product')
    })
  })

  it('should accept the default config', () => {
    expect(validateConfig({ exitOnFailure: false })).to.equal(true)
  })

  it('should throw an error if the config is invalid', () => {
    expect(validateConfig({ products: [], exitOnFailure: false })).to.equal(false)
  })
})
