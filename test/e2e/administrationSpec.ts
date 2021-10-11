/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { $$, browser } from 'protractor'

describe('/#/administration', () => {
  describe('challenge "adminSection"', () => {
    protractor.beforeEach.login({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

    it('should be possible to access administration section with admin user', () => {
      void browser.get(`${protractor.basePath}/#/administration`)
      expect(browser.getCurrentUrl()).toMatch(/\/administration/)
    })

    protractor.expect.challengeSolved({ challenge: 'Admin Section' })
  })

  describe('challenge "fiveStarFeedback"', () => {
    protractor.beforeEach.login({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

    it('should be possible for any admin user to delete feedback', () => {
      void browser.get(`${protractor.basePath}/#/administration`)

      void $$('.mat-cell.mat-column-remove > button').first().click()
    })

    protractor.expect.challengeSolved({ challenge: 'Five-Star Feedback' })
  })
})
