/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')

describe('/#/administration', () => {
  describe('challenge "adminSection"', () => {
    protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

    it('should be possible to access administration section with admin user', () => {
      browser.get(protractor.basePath + '/#/administration')
      expect(browser.getCurrentUrl()).toMatch(/\/administration/)
    })

    protractor.expect.challengeSolved({ challenge: 'Admin Section' })
  })

  describe('challenge "fiveStarFeedback"', () => {
    protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

    it('should be possible for any admin user to delete feedback', () => {
      browser.get(protractor.basePath + '/#/administration')

      $$('.mat-cell.mat-column-remove > button').first().click()
    })

    protractor.expect.challengeSolved({ challenge: 'Five-Star Feedback' })
  })
})
