/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')

describe('/#/privacy-security/data-export', () => {
  xdescribe('challenge "dataExportChallenge"', () => {
    beforeEach(() => {
      browser.get(`${protractor.basePath}/#/register`)
      element(by.id('emailControl')).sendKeys(`admun@${config.get('application.domain')}`)
      element(by.id('passwordControl')).sendKeys('admun123')
      element(by.id('repeatPasswordControl')).sendKeys('admun123')
      element(by.name('securityQuestion')).click()
      element.all(by.cssContainingText('mat-option', 'Your eldest siblings middle name?')).click()
      element(by.id('securityAnswerControl')).sendKeys('admun')
      element(by.id('registerButton')).click()
    })

    protractor.beforeEach.login({ email: `admun@${config.get('application.domain')}`, password: 'admun123' })

    it('should be possible to steal admin user data by causing email clash during export', () => {
      browser.get(`${protractor.basePath}/#/privacy-security/data-export`)
      element(by.id('formatControl')).all(by.tagName('mat-radio-button')).get(0).click()
      element(by.id('submitButton')).click()
    })

    protractor.expect.challengeSolved({ challenge: 'GDPR Data Theft' })
  })
})
