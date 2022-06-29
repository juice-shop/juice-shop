/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { browser, by } from 'protractor'
import { expectChallengeSolved } from './e2eHelpers'

describe('/ftp', () => {
  describe('challenge "confidentialDocument"', () => {
    it('should be able to access file /ftp/acquisitions.md', () => {
      void browser.driver.get(`${browser.baseUrl}/ftp/acquisitions.md`)
    })

    expectChallengeSolved({ challenge: 'Confidential Document' })
  })

  describe('challenge "errorHandling"', () => {
    it('should leak information through error message accessing /ftp/easter.egg due to wrong file suffix', () => {
      void browser.driver.get(`${browser.baseUrl}/ftp/easter.egg`)

      void browser.driver.findElements(by.id('stacktrace')).then(elements => {
        expect(!!elements.length).toBe(true)
      })
    })

    expectChallengeSolved({ challenge: 'Error Handling' })
  })

  describe('challenge "forgottenBackup"', () => {
    it('should be able to access file /ftp/coupons_2013.md.bak with poison null byte attack', () => {
      void browser.driver.get(`${browser.baseUrl}/ftp/coupons_2013.md.bak%2500.md`)
    })

    expectChallengeSolved({ challenge: 'Forgotten Sales Backup' })
  })

  describe('challenge "forgottenDevBackup"', () => {
    it('should be able to access file /ftp/package.json.bak with poison null byte attack', () => {
      void browser.driver.get(`${browser.baseUrl}/ftp/package.json.bak%2500.md`)
    })

    expectChallengeSolved({ challenge: 'Forgotten Developer Backup' })
  })

  describe('challenge "easterEgg1"', () => {
    it('should be able to access file /ftp/easter.egg with poison null byte attack', () => {
      void browser.driver.get(`${browser.baseUrl}/ftp/eastere.gg%2500.md`)
    })

    expectChallengeSolved({ challenge: 'Easter Egg' })
  })

  describe('challenge "misplacedSiemFileChallenge"', () => {
    it('should be able to access file /ftp/suspicious_errors.yml with poison null byte attack', () => {
      void browser.driver.get(`${browser.baseUrl}/ftp/suspicious_errors.yml%2500.md`)
    })

    expectChallengeSolved({ challenge: 'Misplaced Signature File' })
  })

  describe('challenge "nullByteChallenge"', () => {
    it('should be able to access file other than Markdown or PDF in /ftp with poison null byte attack', () => {
      void browser.driver.get(`${browser.baseUrl}/ftp/encrypt.pyc%2500.md`)
    })

    expectChallengeSolved({ challenge: 'Poison Null Byte' })
  })
})
