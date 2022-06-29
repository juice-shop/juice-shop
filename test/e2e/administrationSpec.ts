/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { $$, browser } from 'protractor'
import { basePath, beforeEachLogin, expectChallengeSolved } from './e2eHelpers'

describe('/#/administration', () => {
  describe('challenge "adminSection"', () => {
    beforeEachLogin({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

    it('should be possible to access administration section with admin user', () => {
      void browser.get(`${basePath}/#/administration`)
      expect(browser.getCurrentUrl()).toMatch(/\/administration/)
    })

    expectChallengeSolved({ challenge: 'Admin Section' })
  })

  describe('challenge "fiveStarFeedback"', () => {
    beforeEachLogin({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

    it('should be possible for any admin user to delete feedback', () => {
      void browser.get(`${basePath}/#/administration`)

      void $$('.mat-cell.mat-column-remove > button').first().click()
    })

    expectChallengeSolved({ challenge: 'Five-Star Feedback' })
  })
})
