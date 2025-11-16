/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinonChai from 'sinon-chai'
import validateConfig, {
  checkUnambiguousMandatorySpecialProducts,
  checkUniqueSpecialOnProducts,
  checkYamlSchema,
  checkMinimumRequiredNumberOfProducts,
  checkUnambiguousMandatorySpecialMemories,
  checkMinimumRequiredNumberOfMemories,
  checkUniqueSpecialOnMemories,
  checkSpecialMemoriesHaveNoUserAssociated,
  checkNecessaryExtraKeysOnSpecialProducts
} from '../../lib/startup/validateConfig'
import type { Memory, Product } from 'lib/config.types'

const expect = chai.expect
chai.use(sinonChai)

describe('configValidation', () => {
  const COMMON_PRODUCT = { price: 1, description: 'foo', image: 'bar.jpg' }
  describe('checkUnambiguousMandatorySpecialProducts', () => {
    it('should accept a valid config', () => {
      const products: Product[] = [
        {
          ...COMMON_PRODUCT,
          name: 'Apple Juice',
          useForChristmasSpecialChallenge: true
        },
        {
          ...COMMON_PRODUCT,
          name: 'Orange Juice',
          urlForProductTamperingChallenge: 'foobar'
        },
        {
          ...COMMON_PRODUCT,
          name: 'Melon Juice',
          fileForRetrieveBlueprintChallenge: 'foobar',
          exifForBlueprintChallenge: ['OpenSCAD']
        },
        {
          ...COMMON_PRODUCT,
          name: 'Rippertuer Special Juice',
          keywordsForPastebinDataLeakChallenge: ['bla', 'blubb']
        }
      ]

      expect(checkUnambiguousMandatorySpecialProducts(products)).to.equal(true)
    })

    it('should fail if multiple products are configured for the same challenge', () => {
      const products: Product[] = [
        {
          ...COMMON_PRODUCT,
          name: 'Apple Juice',
          useForChristmasSpecialChallenge: true
        },
        {
          ...COMMON_PRODUCT,
          name: 'Melon Bike',
          useForChristmasSpecialChallenge: true
        },
        {
          ...COMMON_PRODUCT,
          name: 'Orange Juice',
          urlForProductTamperingChallenge: 'foobar'
        },
        {
          ...COMMON_PRODUCT,
          name: 'Melon Juice',
          fileForRetrieveBlueprintChallenge: 'foobar',
          exifForBlueprintChallenge: ['OpenSCAD']
        }
      ]

      expect(checkUnambiguousMandatorySpecialProducts(products)).to.equal(false)
    })

    it('should fail if a required challenge product is missing', () => {
      const products: Product[] = [
        {
          ...COMMON_PRODUCT,
          name: 'Apple Juice',
          useForChristmasSpecialChallenge: true
        },
        {
          ...COMMON_PRODUCT,
          name: 'Orange Juice',
          urlForProductTamperingChallenge: 'foobar'
        }
      ]

      expect(checkUnambiguousMandatorySpecialProducts(products)).to.equal(false)
    })
  })

  describe('checkNecessaryExtraKeysOnSpecialProducts', () => {
    it('should accept a valid config', () => {
      const products: Product[] = [
        {
          ...COMMON_PRODUCT,
          name: 'Apple Juice',
          useForChristmasSpecialChallenge: true
        },
        {
          ...COMMON_PRODUCT,
          name: 'Orange Juice',
          urlForProductTamperingChallenge: 'foobar'
        },
        {
          ...COMMON_PRODUCT,
          name: 'Melon Juice',
          fileForRetrieveBlueprintChallenge: 'foobar',
          exifForBlueprintChallenge: ['OpenSCAD']
        },
        {
          ...COMMON_PRODUCT,
          name: 'Rippertuer Special Juice',
          keywordsForPastebinDataLeakChallenge: ['bla', 'blubb']
        }
      ]

      expect(checkNecessaryExtraKeysOnSpecialProducts(products)).to.equal(true)
    })

    it('should fail if product has no exifForBlueprintChallenge', () => {
      const products: Product[] = [
        {
          ...COMMON_PRODUCT,
          name: 'Apple Juice',
          useForChristmasSpecialChallenge: true
        },
        {
          ...COMMON_PRODUCT,
          name: 'Orange Juice',
          urlForProductTamperingChallenge: 'foobar'
        },
        {
          ...COMMON_PRODUCT,
          name: 'Melon Juice',
          fileForRetrieveBlueprintChallenge: 'foobar'
        },
        {
          ...COMMON_PRODUCT,
          name: 'Rippertuer Special Juice',
          keywordsForPastebinDataLeakChallenge: ['bla', 'blubb']
        }
      ]

      expect(checkNecessaryExtraKeysOnSpecialProducts(products)).to.equal(false)
    })
  })

  describe('checkUniqueSpecialOnProducts', () => {
    it('should accept a valid config', () => {
      const products: Product[] = [
        {
          ...COMMON_PRODUCT,
          name: 'Apple Juice',
          useForChristmasSpecialChallenge: true
        },
        {
          ...COMMON_PRODUCT,
          name: 'Orange Juice',
          urlForProductTamperingChallenge: 'foobar'
        },
        {
          ...COMMON_PRODUCT,
          name: 'Melon Juice',
          fileForRetrieveBlueprintChallenge: 'foobar',
          exifForBlueprintChallenge: ['OpenSCAD']
        },
        {
          ...COMMON_PRODUCT,
          name: 'Rippertuer Special Juice',
          keywordsForPastebinDataLeakChallenge: ['bla', 'blubb']
        }
      ]

      expect(checkUniqueSpecialOnProducts(products)).to.equal(true)
    })

    it('should fail if a product is configured for multiple challenges', () => {
      const products: Product[] = [
        {
          ...COMMON_PRODUCT,
          name: 'Apple Juice',
          useForChristmasSpecialChallenge: true,
          urlForProductTamperingChallenge: 'foobar'
        }
      ]

      expect(checkUniqueSpecialOnProducts(products)).to.equal(false)
    })
  })

  describe('checkMinimumRequiredNumberOfProducts', () => {
    it('should accept a valid config', () => {
      const products: Product[] = [
        {
          ...COMMON_PRODUCT,
          name: 'Apple Juice'
        },
        {
          ...COMMON_PRODUCT,
          name: 'Orange Juice'
        },
        {
          ...COMMON_PRODUCT,
          name: 'Melon Juice'
        },
        {
          ...COMMON_PRODUCT,
          name: 'Rippertuer Special Juice'
        }
      ]

      expect(checkMinimumRequiredNumberOfProducts(products)).to.equal(true)
    })

    it('should fail if less than 4 products are configured', () => {
      const products: Product[] = [
        {
          ...COMMON_PRODUCT,
          name: 'Apple Juice'
        },
        {
          ...COMMON_PRODUCT,
          name: 'Orange Juice'
        },
        {
          ...COMMON_PRODUCT,
          name: 'Melon Juice'
        }
      ]

      expect(checkMinimumRequiredNumberOfProducts(products)).to.equal(false)
    })
  })

  describe('checkUnambiguousMandatorySpecialMemories', () => {
    it('should accept a valid config', () => {
      const memories = [
        {
          image: 'bla.png',
          caption: 'Bla',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar'
        },
        {
          image: 'blubb.png',
          caption: 'Blubb',
          geoStalkingVisualSecurityQuestion: 43,
          geoStalkingVisualSecurityAnswer: 'barfoo'
        }
      ]

      expect(checkUnambiguousMandatorySpecialMemories(memories)).to.equal(true)
    })

    it('should fail if multiple memories are configured for the same challenge', () => {
      const memories: Memory[] = [
        {
          image: 'bla.png',
          caption: 'Bla',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar'
        },
        {
          image: 'blubb.png',
          caption: 'Blubb',
          geoStalkingVisualSecurityQuestion: 43,
          geoStalkingVisualSecurityAnswer: 'barfoo'
        },
        {
          image: 'lalala.png',
          caption: 'Lalala',
          geoStalkingMetaSecurityQuestion: 46,
          geoStalkingMetaSecurityAnswer: 'foobarfoo'
        }
      ]

      expect(checkUnambiguousMandatorySpecialMemories(memories)).to.equal(false)
    })

    it('should fail if a required challenge memory is missing', () => {
      const memories: Memory[] = [
        {
          image: 'bla.png',
          caption: 'Bla',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar'
        }
      ]

      expect(checkUnambiguousMandatorySpecialMemories(memories)).to.equal(false)
    })

    it('should fail if memories have mixed up the required challenge keys', () => {
      const memories: Memory[] = [
        {
          image: 'bla.png',
          caption: 'Bla',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingVisualSecurityAnswer: 'foobar'
        },
        {
          image: 'blubb.png',
          caption: 'Blubb',
          geoStalkingVisualSecurityQuestion: 43,
          geoStalkingMetaSecurityAnswer: 'barfoo'
        }
      ]

      expect(checkUnambiguousMandatorySpecialMemories(memories)).to.equal(false)
    })
  })

  describe('checkThatThereIsOnlyOneMemoryPerSpecial', () => {
    it('should accept a valid config', () => {
      const memories: Memory[] = [
        {
          image: 'bla.png',
          caption: 'Bla',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar'
        },
        {
          image: 'blubb.png',
          caption: 'Blubb',
          geoStalkingVisualSecurityQuestion: 43,
          geoStalkingVisualSecurityAnswer: 'barfoo'
        }
      ]

      expect(checkUniqueSpecialOnMemories(memories)).to.equal(true)
    })

    it('should fail if a memory is configured for multiple challenges', () => {
      const memories: Memory[] = [
        {
          image: 'bla.png',
          caption: 'Bla',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar',
          geoStalkingVisualSecurityQuestion: 43,
          geoStalkingVisualSecurityAnswer: 'barfoo'
        }
      ]

      expect(checkUniqueSpecialOnMemories(memories)).to.equal(false)
    })
  })

  describe('checkSpecialMemoriesHaveNoUserAssociated', () => {
    it('should accept a valid config', () => {
      const memories: Memory[] = [
        {
          image: 'bla.png',
          caption: 'Bla',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar'
        },
        {
          image: 'blubb.png',
          caption: 'Blubb',
          geoStalkingVisualSecurityQuestion: 43,
          geoStalkingVisualSecurityAnswer: 'barfoo'
        }
      ]

      expect(checkSpecialMemoriesHaveNoUserAssociated(memories)).to.equal(true)
    })

    it('should accept a config where the default users are associated', () => {
      const memories: Memory[] = [
        {
          user: 'john',
          image: 'bla.png',
          caption: 'Bla',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar'
        },
        {
          user: 'emma',
          image: 'blubb.png',
          caption: 'Blubb',
          geoStalkingVisualSecurityQuestion: 43,
          geoStalkingVisualSecurityAnswer: 'barfoo'
        }
      ]

      expect(checkSpecialMemoriesHaveNoUserAssociated(memories)).to.equal(true)
    })

    it('should fail if a memory is linked to another user', () => {
      const memories: Memory[] = [
        {
          user: 'admin',
          image: 'bla.png',
          caption: 'Bla',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar'
        }
      ]

      expect(checkSpecialMemoriesHaveNoUserAssociated(memories)).to.equal(false)
    })
  })

  describe('checkMinimumRequiredNumberOfMemories', () => {
    it('should accept a valid config', () => {
      const memories: Memory[] = [
        {
          image: 'bla.png',
          caption: 'Bla',
          user: 'admin'
        },
        {
          image: 'blubb.png',
          caption: 'Blubb',
          user: 'bjoern'
        }
      ]

      expect(checkMinimumRequiredNumberOfMemories(memories)).to.equal(true)
    })

    it('should fail if less than 2 memories are configured', () => {
      const memories: Memory[] = [
        {
          image: 'bla.png',
          caption: 'Bla',
          user: 'admin'
        }
      ]

      expect(checkMinimumRequiredNumberOfMemories(memories)).to.equal(false)
    })
  })

  it(`should accept the active config from config/${process.env.NODE_ENV}.yml`, async () => {
    expect(await validateConfig({ exitOnFailure: false })).to.equal(true)
  })

  it('should fail if the config is invalid', async () => {
    expect(await validateConfig({ products: [], exitOnFailure: false })).to.equal(false)
  })

  it('should accept a config with valid schema', () => {
    const config = {
      application: {
        domain: 'juice-b.ox',
        name: 'OWASP Juice Box',
        welcomeBanner: {
          showOnFirstStart: false
        }
      },
      hackingInstructor: {
        avatarImage: 'juicyEvilWasp.png'
      }
    }

    expect(checkYamlSchema(config)).to.equal(true)
  })

  it('should fail for a config with schema errors', () => {
    const config = {
      application: {
        domain: 42,
        id: 'OWASP Juice Box',
        welcomeBanner: {
          showOnFirstStart: 'yes'
        }
      },
      hackingInstructor: {
        avatarImage: true
      }
    }

    expect(checkYamlSchema(config)).to.equal(false)
  })
})
