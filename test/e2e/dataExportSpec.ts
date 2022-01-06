/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { browser, by, element } from 'protractor'
import { basePath, beforeEachLogin, expectChallengeSolved } from './e2eHelpers'

describe('/#/privacy-security/data-export', () => {
  xdescribe('challenge "dataExportChallenge"', () => {
    beforeEach(() => {
      void browser.get(`${basePath}/#/register`)
      void element(by.id('emailControl')).sendKeys(`admun@${config.get('application.domain')}`)
      void element(by.id('passwordControl')).sendKeys('admun123')
      void element(by.id('repeatPasswordControl')).sendKeys('admun123')
      void element(by.name('securityQuestion')).click()
      void element.all(by.cssContainingText('mat-option', 'Your eldest siblings middle name?')).click()
      void element(by.id('securityAnswerControl')).sendKeys('admun')
      void element(by.id('registerButton')).click()
    })

    beforeEachLogin({ email: `admun@${config.get('application.domain')}`, password: 'admun123' })

    it('should be possible to steal admin user data by causing email clash during export', () => {
      void browser.get(`${basePath}/#/privacy-security/data-export`)
      void element(by.id('formatControl')).all(by.tagName('mat-radio-button')).get(0).click()
      void element(by.id('submitButton')).click()
    })

    expectChallengeSolved({ challenge: 'GDPR Data Theft' })
  })
})
