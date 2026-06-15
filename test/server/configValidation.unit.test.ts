/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import validateConfig, {
  checkUnambiguousMandatorySpecialProducts,
  checkUniqueSpecialOnProducts,
  checkConfigSchema,
  checkMinimumRequiredNumberOfProducts,
  checkUnambiguousMandatorySpecialMemories,
  checkMinimumRequiredNumberOfMemories,
  checkUniqueSpecialOnMemories,
  checkSpecialMemoriesHaveNoUserAssociated,
  checkNecessaryExtraKeysOnSpecialProducts,
  checkForIllogicalCombos
} from '../../lib/startup/validateConfig'
import type { Memory, Product } from '@juice-shop/lib/config.schema'

void describe('configValidation', () => {
  const COMMON_PRODUCT = { price: 1, description: 'foo', image: 'bar.jpg' }

  void describe('checkUnambiguousMandatorySpecialProducts', () => {
    void it('should accept a valid config', () => {
      const products: Product[] = [
        { ...COMMON_PRODUCT, name: 'Apple Juice', useForChristmasSpecialChallenge: true },
        { ...COMMON_PRODUCT, name: 'Orange Juice', urlForProductTamperingChallenge: 'foobar' },
        { ...COMMON_PRODUCT, name: 'Melon Juice', fileForRetrieveBlueprintChallenge: 'foobar', exifForBlueprintChallenge: ['OpenSCAD'] },
        { ...COMMON_PRODUCT, name: 'Rippertuer Special Juice', keywordsForPastebinDataLeakChallenge: ['bla', 'blubb'] }
      ]

      assert.equal(checkUnambiguousMandatorySpecialProducts(products), true)
    })

    void it('should fail if multiple products are configured for the same challenge', () => {
      const products: Product[] = [
        { ...COMMON_PRODUCT, name: 'Apple Juice', useForChristmasSpecialChallenge: true },
        { ...COMMON_PRODUCT, name: 'Melon Bike', useForChristmasSpecialChallenge: true },
        { ...COMMON_PRODUCT, name: 'Orange Juice', urlForProductTamperingChallenge: 'foobar' },
        { ...COMMON_PRODUCT, name: 'Melon Juice', fileForRetrieveBlueprintChallenge: 'foobar', exifForBlueprintChallenge: ['OpenSCAD'] }
      ]

      assert.equal(checkUnambiguousMandatorySpecialProducts(products), false)
    })

    void it('should fail if a required challenge product is missing', () => {
      const products: Product[] = [
        { ...COMMON_PRODUCT, name: 'Apple Juice', useForChristmasSpecialChallenge: true },
        { ...COMMON_PRODUCT, name: 'Orange Juice', urlForProductTamperingChallenge: 'foobar' }
      ]

      assert.equal(checkUnambiguousMandatorySpecialProducts(products), false)
    })
  })

  void describe('checkNecessaryExtraKeysOnSpecialProducts', () => {
    void it('should accept a valid config', () => {
      const products: Product[] = [
        { ...COMMON_PRODUCT, name: 'Apple Juice', useForChristmasSpecialChallenge: true },
        { ...COMMON_PRODUCT, name: 'Orange Juice', urlForProductTamperingChallenge: 'foobar' },
        { ...COMMON_PRODUCT, name: 'Melon Juice', fileForRetrieveBlueprintChallenge: 'foobar', exifForBlueprintChallenge: ['OpenSCAD'] },
        { ...COMMON_PRODUCT, name: 'Rippertuer Special Juice', keywordsForPastebinDataLeakChallenge: ['bla', 'blubb'] }
      ]

      assert.equal(checkNecessaryExtraKeysOnSpecialProducts(products), true)
    })

    void it('should fail if product has no exifForBlueprintChallenge', () => {
      const products: Product[] = [
        { ...COMMON_PRODUCT, name: 'Apple Juice', useForChristmasSpecialChallenge: true },
        { ...COMMON_PRODUCT, name: 'Orange Juice', urlForProductTamperingChallenge: 'foobar' },
        { ...COMMON_PRODUCT, name: 'Melon Juice', fileForRetrieveBlueprintChallenge: 'foobar' },
        { ...COMMON_PRODUCT, name: 'Rippertuer Special Juice', keywordsForPastebinDataLeakChallenge: ['bla', 'blubb'] }
      ]

      assert.equal(checkNecessaryExtraKeysOnSpecialProducts(products), false)
    })
  })

  void describe('checkUniqueSpecialOnProducts', () => {
    void it('should accept a valid config', () => {
      const products: Product[] = [
        { ...COMMON_PRODUCT, name: 'Apple Juice', useForChristmasSpecialChallenge: true },
        { ...COMMON_PRODUCT, name: 'Orange Juice', urlForProductTamperingChallenge: 'foobar' },
        { ...COMMON_PRODUCT, name: 'Melon Juice', fileForRetrieveBlueprintChallenge: 'foobar', exifForBlueprintChallenge: ['OpenSCAD'] },
        { ...COMMON_PRODUCT, name: 'Rippertuer Special Juice', keywordsForPastebinDataLeakChallenge: ['bla', 'blubb'] }
      ]

      assert.equal(checkUniqueSpecialOnProducts(products), true)
    })

    void it('should fail if a product is configured for multiple challenges', () => {
      const products: Product[] = [
        { ...COMMON_PRODUCT, name: 'Apple Juice', useForChristmasSpecialChallenge: true, urlForProductTamperingChallenge: 'foobar' }
      ]

      assert.equal(checkUniqueSpecialOnProducts(products), false)
    })
  })

  void describe('checkMinimumRequiredNumberOfProducts', () => {
    void it('should accept a valid config', () => {
      const products: Product[] = [
        { ...COMMON_PRODUCT, name: 'Apple Juice' },
        { ...COMMON_PRODUCT, name: 'Orange Juice' },
        { ...COMMON_PRODUCT, name: 'Melon Juice' },
        { ...COMMON_PRODUCT, name: 'Rippertuer Special Juice' }
      ]

      assert.equal(checkMinimumRequiredNumberOfProducts(products), true)
    })

    void it('should fail if less than 4 products are configured', () => {
      const products: Product[] = [
        { ...COMMON_PRODUCT, name: 'Apple Juice' },
        { ...COMMON_PRODUCT, name: 'Orange Juice' },
        { ...COMMON_PRODUCT, name: 'Melon Juice' }
      ]

      assert.equal(checkMinimumRequiredNumberOfProducts(products), false)
    })
  })

  void describe('checkUnambiguousMandatorySpecialMemories', () => {
    void it('should accept a valid config', () => {
      const memories = [
        { image: 'bla.png', caption: 'Bla', geoStalkingMetaSecurityQuestion: 42, geoStalkingMetaSecurityAnswer: 'foobar' },
        { image: 'blubb.png', caption: 'Blubb', geoStalkingVisualSecurityQuestion: 43, geoStalkingVisualSecurityAnswer: 'barfoo' }
      ]

      assert.equal(checkUnambiguousMandatorySpecialMemories(memories), true)
    })

    void it('should fail if multiple memories are configured for the same challenge', () => {
      const memories: Memory[] = [
        { image: 'bla.png', caption: 'Bla', geoStalkingMetaSecurityQuestion: 42, geoStalkingMetaSecurityAnswer: 'foobar' },
        { image: 'blubb.png', caption: 'Blubb', geoStalkingVisualSecurityQuestion: 43, geoStalkingVisualSecurityAnswer: 'barfoo' },
        { image: 'lalala.png', caption: 'Lalala', geoStalkingMetaSecurityQuestion: 46, geoStalkingMetaSecurityAnswer: 'foobarfoo' }
      ]

      assert.equal(checkUnambiguousMandatorySpecialMemories(memories), false)
    })

    void it('should fail if a required challenge memory is missing', () => {
      const memories: Memory[] = [
        { image: 'bla.png', caption: 'Bla', geoStalkingMetaSecurityQuestion: 42, geoStalkingMetaSecurityAnswer: 'foobar' }
      ]

      assert.equal(checkUnambiguousMandatorySpecialMemories(memories), false)
    })

    void it('should fail if memories have mixed up the required challenge keys', () => {
      const memories: Memory[] = [
        { image: 'bla.png', caption: 'Bla', geoStalkingMetaSecurityQuestion: 42, geoStalkingVisualSecurityAnswer: 'foobar' },
        { image: 'blubb.png', caption: 'Blubb', geoStalkingVisualSecurityQuestion: 43, geoStalkingMetaSecurityAnswer: 'barfoo' }
      ]

      assert.equal(checkUnambiguousMandatorySpecialMemories(memories), false)
    })
  })

  void describe('checkThatThereIsOnlyOneMemoryPerSpecial', () => {
    void it('should accept a valid config', () => {
      const memories: Memory[] = [
        { image: 'bla.png', caption: 'Bla', geoStalkingMetaSecurityQuestion: 42, geoStalkingMetaSecurityAnswer: 'foobar' },
        { image: 'blubb.png', caption: 'Blubb', geoStalkingVisualSecurityQuestion: 43, geoStalkingVisualSecurityAnswer: 'barfoo' }
      ]

      assert.equal(checkUniqueSpecialOnMemories(memories), true)
    })

    void it('should fail if a memory is configured for multiple challenges', () => {
      const memories: Memory[] = [
        { image: 'bla.png', caption: 'Bla', geoStalkingMetaSecurityQuestion: 42, geoStalkingMetaSecurityAnswer: 'foobar', geoStalkingVisualSecurityQuestion: 43, geoStalkingVisualSecurityAnswer: 'barfoo' }
      ]

      assert.equal(checkUniqueSpecialOnMemories(memories), false)
    })
  })

  void describe('checkSpecialMemoriesHaveNoUserAssociated', () => {
    void it('should accept a valid config', () => {
      const memories: Memory[] = [
        { image: 'bla.png', caption: 'Bla', geoStalkingMetaSecurityQuestion: 42, geoStalkingMetaSecurityAnswer: 'foobar' },
        { image: 'blubb.png', caption: 'Blubb', geoStalkingVisualSecurityQuestion: 43, geoStalkingVisualSecurityAnswer: 'barfoo' }
      ]

      assert.equal(checkSpecialMemoriesHaveNoUserAssociated(memories), true)
    })

    void it('should accept a config where the default users are associated', () => {
      const memories: Memory[] = [
        { user: 'john', image: 'bla.png', caption: 'Bla', geoStalkingMetaSecurityQuestion: 42, geoStalkingMetaSecurityAnswer: 'foobar' },
        { user: 'emma', image: 'blubb.png', caption: 'Blubb', geoStalkingVisualSecurityQuestion: 43, geoStalkingVisualSecurityAnswer: 'barfoo' }
      ]

      assert.equal(checkSpecialMemoriesHaveNoUserAssociated(memories), true)
    })

    void it('should fail if a memory is linked to another user', () => {
      const memories: Memory[] = [
        { user: 'admin', image: 'bla.png', caption: 'Bla', geoStalkingMetaSecurityQuestion: 42, geoStalkingMetaSecurityAnswer: 'foobar' }
      ]

      assert.equal(checkSpecialMemoriesHaveNoUserAssociated(memories), false)
    })
  })

  void describe('checkMinimumRequiredNumberOfMemories', () => {
    void it('should accept a valid config', () => {
      const memories: Memory[] = [
        { image: 'bla.png', caption: 'Bla', user: 'admin' },
        { image: 'blubb.png', caption: 'Blubb', user: 'bjoern' }
      ]

      assert.equal(checkMinimumRequiredNumberOfMemories(memories), true)
    })

    void it('should fail if less than 2 memories are configured', () => {
      const memories: Memory[] = [
        { image: 'bla.png', caption: 'Bla', user: 'admin' }
      ]

      assert.equal(checkMinimumRequiredNumberOfMemories(memories), false)
    })
  })

  void it(`should accept the active config from config/${process.env.NODE_ENV}.yml`, async () => {
    assert.equal(await validateConfig({ exitOnFailure: false }), true)
  })

  void it('should fail if the config is invalid', async () => {
    assert.equal(await validateConfig({ products: [], exitOnFailure: false }), false)
  })

  void it('should accept a config with valid schema', () => {
    const config = {
      application: {
        domain: 'juice-b.ox',
        name: 'OWASP Juice Box',
        welcomeBanner: { showOnFirstStart: false }
      },
      hackingInstructor: { avatarImage: 'juicyEvilWasp.png' }
    }

    assert.equal(checkConfigSchema(config), true)
  })

  void it('should accept a config that blanks out arbitrary fields with null', () => {
    const config = {
      application: {
        name: null,
        logo: null,
        social: { twitterUrl: null, facebookUrl: null },
        securityTxt: { encryption: null }
      },
      server: { port: null }
    }

    assert.equal(checkConfigSchema(config), true)
  })

  void it('should fail for a config with schema errors', () => {
    const config = {
      application: {
        domain: 42,
        id: 'OWASP Juice Box',
        welcomeBanner: { showOnFirstStart: 'yes' }
      },
      hackingInstructor: { avatarImage: true }
    }

    assert.equal(checkConfigSchema(config), false)
  })

  void describe('checkForIllogicalCombos', () => {
    const BASE_CONFIG = {
      challenges: { restrictToTutorialsFirst: false, showSolvedNotifications: true },
      hackingInstructor: { isEnabled: true },
      ctf: { showFlagsInNotifications: false, showCountryDetailsInNotifications: 'none' }
    }

    void it('should accept a config without systemWideNotifications set', () => {
      assert.equal(checkForIllogicalCombos(BASE_CONFIG), true)
    })

    void it('should accept a config with systemWideNotifications url and pollFrequencySeconds set', () => {
      const config = { ...BASE_CONFIG, ctf: { ...BASE_CONFIG.ctf, systemWideNotifications: { url: 'http://example.com/notify', pollFrequencySeconds: 30 } } }
      assert.equal(checkForIllogicalCombos(config), true)
    })

    void it('should fail if systemWideNotifications url is set but pollFrequencySeconds is missing', () => {
      const config = { ...BASE_CONFIG, ctf: { ...BASE_CONFIG.ctf, systemWideNotifications: { url: 'http://example.com/notify' } } }
      assert.equal(checkForIllogicalCombos(config), false)
    })

    void it('should fail if systemWideNotifications url is set but pollFrequencySeconds is zero', () => {
      const config = { ...BASE_CONFIG, ctf: { ...BASE_CONFIG.ctf, systemWideNotifications: { url: 'http://example.com/notify', pollFrequencySeconds: 0 } } }
      assert.equal(checkForIllogicalCombos(config), false)
    })

    void it('should fail if systemWideNotifications url is set but pollFrequencySeconds is negative', () => {
      const config = { ...BASE_CONFIG, ctf: { ...BASE_CONFIG.ctf, systemWideNotifications: { url: 'http://example.com/notify', pollFrequencySeconds: -10 } } }
      assert.equal(checkForIllogicalCombos(config), false)
    })
  })
})
