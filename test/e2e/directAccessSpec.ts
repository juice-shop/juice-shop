/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { browser } from 'protractor'
const utils = require('../../lib/utils')
let blueprint: string

for (const product of config.get('products')) {
  if (product.fileForRetrieveBlueprintChallenge) {
    blueprint = product.fileForRetrieveBlueprintChallenge
    break
  }
}

describe('/', () => {
  describe('challenge "easterEgg2"', () => {
    it('should be able to access "secret" url for easter egg', () => {
      void browser.driver.get(`${browser.baseUrl}/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg`)
    })

    protractor.expect.challengeSolved({ challenge: 'Nested Easter Egg' })
  })

  describe('challenge "premiumPaywall"', () => {
    it('should be able to access "super secret" url for premium content', () => {
      void browser.driver.get(`${browser.baseUrl}/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us`)
    })

    protractor.expect.challengeSolved({ challenge: 'Premium Paywall' })
  })

  describe('challenge "privacyPolicyProof"', () => {
    it('should be able to access proof url for reading the privacy policy', () => {
      void browser.driver.get(`${browser.baseUrl}/we/may/also/instruct/you/to/refuse/all/reasonably/necessary/responsibility`)
    })

    protractor.expect.challengeSolved({ challenge: 'Privacy Policy Inspection' })
  })

  describe('challenge "extraLanguage"', () => {
    it('should be able to access the Klingon translation file', () => {
      void browser.driver.get(`${browser.baseUrl}/assets/i18n/tlh_AA.json`)
    })

    protractor.expect.challengeSolved({ challenge: 'Extra Language' })
  })

  describe('challenge "retrieveBlueprint"', () => {
    it('should be able to access the blueprint file', () => {
      void browser.driver.get(`${browser.baseUrl}/assets/public/images/products/${blueprint}`)
    })

    protractor.expect.challengeSolved({ challenge: 'Retrieve Blueprint' })
  })

  describe('challenge "missingEncoding"', () => {
    it('should be able to access the crazy cat photo', () => {
      void browser.driver.get(`${browser.baseUrl}/assets/public/images/uploads/%F0%9F%98%BC-%23zatschi-%23whoneedsfourlegs-1572600969477.jpg`)
    })

    protractor.expect.challengeSolved({ challenge: 'Missing Encoding' })
  })

  describe('challenge "securityPolicy"', () => {
    it('should be able to access the security.txt file', () => {
      void browser.driver.get(`${browser.baseUrl}/.well-known/security.txt`)
    })

    protractor.expect.challengeSolved({ challenge: 'Security Policy' })
  })

  describe('challenge "emailLeak"', () => {
    it('should be able to request the callback on /rest/user/whoami', () => {
      void browser.driver.get(`${browser.baseUrl}/rest/user/whoami?callback=func`)
    })

    protractor.expect.challengeSolved({ challenge: 'Email Leak' })
  })

  describe('challenge "accessLogDisclosure"', () => {
    it('should be able to access today\'s access log file', () => {
      void browser.driver.get(`${browser.baseUrl}/support/logs/access.log.${utils.toISO8601(new Date())}`)
    })

    protractor.expect.challengeSolved({ challenge: 'Access Log' })
  })
})
