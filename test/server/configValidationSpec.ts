/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

const validateConfig = require('../../lib/startup/validateConfig')
const { checkUnambiguousMandatorySpecialProducts, checkUniqueSpecialOnProducts, checkYamlSchema, checkMinimumRequiredNumberOfProducts, checkUnambiguousMandatorySpecialMemories, checkMinimumRequiredNumberOfMemories, checkUniqueSpecialOnMemories, checkSpecialMemoriesHaveNoUserAssociated, checkNecessaryExtraKeysOnSpecialProducts } = require('../../lib/startup/validateConfig')

describe('configValidation', () => {
  describe('checkUnambiguousMandatorySpecialProducts', () => {
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
          fileForRetrieveBlueprintChallenge: 'foobar',
          exifForBlueprintChallenge: ['OpenSCAD']
        },
        {
          name: 'Rippertuer Special Juice',
          keywordsForPastebinDataLeakChallenge: ['bla', 'blubb']
        }
      ]

      expect(checkUnambiguousMandatorySpecialProducts(products)).to.equal(true)
    })

    it('should fail if multiple products are configured for the same challenge', () => {
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
          fileForRetrieveBlueprintChallenge: 'foobar',
          exifForBlueprintChallenge: ['OpenSCAD']
        }
      ]

      expect(checkUnambiguousMandatorySpecialProducts(products)).to.equal(false)
    })

    it('should fail if a required challenge product is missing', () => {
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

      expect(checkUnambiguousMandatorySpecialProducts(products)).to.equal(false)
    })
  })

  describe('checkNecessaryExtraKeysOnSpecialProducts', () => {
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
          fileForRetrieveBlueprintChallenge: 'foobar',
          exifForBlueprintChallenge: ['OpenSCAD']
        },
        {
          name: 'Rippertuer Special Juice',
          keywordsForPastebinDataLeakChallenge: ['bla', 'blubb']
        }
      ]

      expect(checkNecessaryExtraKeysOnSpecialProducts(products)).to.equal(true)
    })

    xit('should fail if product has no exifForBlueprintChallenge', () => { // TODO Turn back on with v13.x release
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
        },
        {
          name: 'Rippertuer Special Juice',
          keywordsForPastebinDataLeakChallenge: ['bla', 'blubb']
        }
      ]

      expect(checkNecessaryExtraKeysOnSpecialProducts(products)).to.equal(false)
    })
  })

  describe('checkUniqueSpecialOnProducts', () => {
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
          fileForRetrieveBlueprintChallenge: 'foobar',
          exifForBlueprintChallenge: ['OpenSCAD']
        },
        {
          name: 'Rippertuer Special Juice',
          keywordsForPastebinDataLeakChallenge: ['bla', 'blubb']
        }
      ]

      expect(checkUniqueSpecialOnProducts(products)).to.equal(true)
    })

    it('should fail if a product is configured for multiple challenges', () => {
      const products = [
        {
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
      const products = [
        {
          name: 'Apple Juice'
        },
        {
          name: 'Orange Juice'
        },
        {
          name: 'Melon Juice'
        },
        {
          name: 'Rippertuer Special Juice'
        }
      ]

      expect(checkMinimumRequiredNumberOfProducts(products)).to.equal(true)
    })

    it('should fail if less than 4 products are configured', () => {
      const products = [
        {
          name: 'Apple Juice'
        },
        {
          name: 'Orange Juice'
        },
        {
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
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar'
        },
        {
          image: 'blubb.png',
          geoStalkingVisualSecurityQuestion: 43,
          geoStalkingVisualSecurityAnswer: 'barfoo'
        }
      ]

      expect(checkUnambiguousMandatorySpecialMemories(memories)).to.equal(true)
    })

    it('should fail if multiple memories are configured for the same challenge', () => {
      const memories = [
        {
          image: 'bla.png',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar'
        },
        {
          image: 'blubb.png',
          geoStalkingVisualSecurityQuestion: 43,
          geoStalkingVisualSecurityAnswer: 'barfoo'
        },
        {
          image: 'lalala.png',
          geoStalkingMetaSecurityQuestion: 46,
          geoStalkingMetaSecurityAnswer: 'foobarfoo'
        }
      ]

      expect(checkUnambiguousMandatorySpecialMemories(memories)).to.equal(false)
    })

    it('should fail if a required challenge memory is missing', () => {
      const memories = [
        {
          image: 'bla.png',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar'
        }
      ]

      expect(checkUnambiguousMandatorySpecialMemories(memories)).to.equal(false)
    })

    it('should fail if memories have mixed up the required challenge keys', () => {
      const memories = [
        {
          image: 'bla.png',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingVisualSecurityAnswer: 'foobar'
        },
        {
          image: 'blubb.png',
          geoStalkingVisualSecurityQuestion: 43,
          geoStalkingMetaSecurityAnswer: 'barfoo'
        }
      ]

      expect(checkUnambiguousMandatorySpecialMemories(memories)).to.equal(false)
    })
  })

  describe('checkThatThereIsOnlyOneMemoryPerSpecial', () => {
    it('should accept a valid config', () => {
      const memories = [
        {
          image: 'bla.png',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar'
        },
        {
          image: 'blubb.png',
          geoStalkingVisualSecurityQuestion: 43,
          geoStalkingVisualSecurityAnswer: 'barfoo'
        }
      ]

      expect(checkUniqueSpecialOnMemories(memories)).to.equal(true)
    })

    it('should fail if a memory is configured for multiple challenges', () => {
      const memories = [
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
      const memories = [
        {
          image: 'bla.png',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar'
        },
        {
          image: 'blubb.png',
          geoStalkingVisualSecurityQuestion: 43,
          geoStalkingVisualSecurityAnswer: 'barfoo'
        }
      ]

      expect(checkSpecialMemoriesHaveNoUserAssociated(memories)).to.equal(true)
    })

    it('should accept a config where the default users are associated', () => {
      const memories = [
        {
          user: 'john',
          image: 'bla.png',
          geoStalkingMetaSecurityQuestion: 42,
          geoStalkingMetaSecurityAnswer: 'foobar'
        },
        {
          user: 'emma',
          image: 'blubb.png',
          geoStalkingVisualSecurityQuestion: 43,
          geoStalkingVisualSecurityAnswer: 'barfoo'
        }
      ]

      expect(checkSpecialMemoriesHaveNoUserAssociated(memories)).to.equal(true)
    })

    it('should fail if a memory is linked to another user', () => {
      const memories = [
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
      const memories = [
        {
          image: 'bla.png',
          user: 'admin'
        },
        {
          image: 'blubb.png',
          user: 'bjoern'
        }
      ]

      expect(checkMinimumRequiredNumberOfMemories(memories)).to.equal(true)
    })

    it('should fail if less than 2 memories are configured', () => {
      const memories = [
        {
          image: 'bla.png',
          user: 'admin'
        }
      ]

      expect(checkMinimumRequiredNumberOfMemories(memories)).to.equal(false)
    })
  })

  it('should accept the default config', () => {
    expect(validateConfig({ exitOnFailure: false })).to.equal(true)
  })

  it('should fail if the config is invalid', () => {
    expect(validateConfig({ products: [], exitOnFailure: false })).to.equal(false)
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
