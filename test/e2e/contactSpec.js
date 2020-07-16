/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')
const utils = require('../../lib/utils')
const pastebinLeakProduct = config.get('products').filter(product => product.keywordsForPastebinDataLeakChallenge)[0]

describe('/#/contact', () => {
  let comment, rating, submitButton, captcha, snackBar

  beforeEach(() => {
    browser.get(protractor.basePath + '/#/contact')
    comment = element(by.id('comment'))
    rating = $$('.br-unit').last()
    captcha = element(by.id('captchaControl'))
    submitButton = element(by.id('submitButton'))
    snackBar = element(by.css('.mat-simple-snackbar-action.ng-star-inserted')).element(by.css('.mat-focus-indicator.mat-button.mat-button-base'))
    solveNextCaptcha()
  })

  describe('challenge "forgedFeedback"', () => {
    protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

    it('should be possible to provide feedback as another user', () => {
      const EC = protractor.ExpectedConditions
      browser.executeScript('document.getElementById("userId").removeAttribute("hidden");')
      browser.executeScript('document.getElementById("userId").removeAttribute("class");')
      browser.wait(EC.visibilityOf($('#userId')), 5000)

      const UserId = element(by.id('userId'))
      UserId.clear()
      UserId.sendKeys('2')
      comment.sendKeys('Picard stinks!')
      rating.click()

      submitButton.click()

      browser.get(protractor.basePath + '/#/administration')
      expect($$('mat-row mat-cell.mat-column-user').last().getText()).toMatch('2')
    })

    protractor.expect.challengeSolved({ challenge: 'Forged Feedback' })
  })

  if (!utils.disableOnContainerEnv()) {
    describe('challenge "persistedXssFeedback"', () => {
      protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

      it('should be possible to trick the sanitization with a masked XSS attack', () => {
        const EC = protractor.ExpectedConditions

        comment.sendKeys('<<script>Foo</script>iframe src="javascript:alert(`xss`)">')
        rating.click()

        submitButton.click()

        browser.sleep(5000)

        browser.waitForAngularEnabled(false)
        browser.get(protractor.basePath + '/#/about')

        browser.wait(EC.alertIsPresent(), 15000, "'xss' alert is not present on /#/about")
        browser.switchTo().alert().then(alert => {
          expect(alert.getText()).toEqual('xss')
          alert.accept()
        })

        browser.get(protractor.basePath + '/#/administration')
        browser.wait(EC.alertIsPresent(), 15000, "'xss' alert is not present on /#/administration")
        browser.switchTo().alert().then(alert => {
          expect(alert.getText()).toEqual('xss')
          alert.accept()
          $$('.mat-cell.mat-column-remove > button').last().click()
          browser.wait(EC.stalenessOf(element(by.tagName('iframe'))), 5000)
        })
        browser.waitForAngularEnabled(true)
      })

      protractor.expect.challengeSolved({ challenge: 'Server-side XSS Protection' })
    })
  }

  describe('challenge "vulnerableComponent"', () => {
    it('should be possible to post known vulnerable component(s) as feedback', () => {
      comment.sendKeys('sanitize-html 1.4.2 is non-recursive.')
      comment.sendKeys('express-jwt 0.1.3 has broken crypto.')
      rating.click()

      submitButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Vulnerable Library' })
  })

  describe('challenge "weirdCrypto"', () => {
    it('should be possible to post weird crypto algorithm/library as feedback', () => {
      comment.sendKeys('The following libraries are bad for crypto: z85, base85, md5 and hashids')
      rating.click()

      submitButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Weird Crypto' })
  })

  describe('challenge "typosquattingNpm"', () => {
    it('should be possible to post typosquatting NPM package as feedback', () => {
      comment.sendKeys('You are a typosquatting victim of this NPM package: epilogue-js')
      rating.click()

      submitButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Legacy Typosquatting' })
  })

  describe('challenge "typosquattingAngular"', () => {
    it('should be possible to post typosquatting Bower package as feedback', () => {
      comment.sendKeys('You are a typosquatting victim of this Bower package: ng2-bar-rating')
      rating.click()

      submitButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Frontend Typosquatting' })
  })

  describe('challenge "hiddenImage"', () => {
    it('should be possible to post hidden character name as feedback', () => {
      comment.sendKeys('Pickle Rick is hiding behind one of the support team ladies')
      rating.click()

      submitButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Steganography' })
  })

  describe('challenge "zeroStars"', () => {
    it('should be possible to post feedback with zero stars by double-clicking rating widget', () => {
      browser.executeAsyncScript(baseUrl => {
        var callback = arguments[arguments.length - 1] // eslint-disable-line
        var xhttp = new XMLHttpRequest()
        var captcha
        xhttp.onreadystatechange = function () {
          if (this.status === 200) {
            captcha = JSON.parse(this.responseText)
            sendPostRequest(captcha)
          }
        }

        xhttp.open('GET', baseUrl + '/rest/captcha/', true)
        xhttp.setRequestHeader('Content-type', 'text/plain')
        xhttp.send()

        function sendPostRequest (_captcha) {
          var xhttp = new XMLHttpRequest()
          xhttp.onreadystatechange = function () {
            if (this.status === 201) {
              console.log('Success')
              callback()
            }
          }

          xhttp.open('POST', baseUrl + '/api/Feedbacks', true)
          xhttp.setRequestHeader('Content-type', 'application/json')
          xhttp.send(JSON.stringify({"captchaId": _captcha.captchaId, "captcha": `${_captcha.answer}`, "comment": "Comment", "rating": 0})) // eslint-disable-line
        }
      }, browser.baseUrl)
    })

    protractor.expect.challengeSolved({ challenge: 'Zero Stars' })
  })

  describe('challenge "captchaBypass"', () => {
    const EC = protractor.ExpectedConditions
    // FIXME Find faster alternative to consistently fire 10 feedbacks in a row within 10sec time limit
    xit('should be possible to post 10 or more customer feedbacks in less than 10 seconds', () => {
      browser.waitForAngularEnabled(false)

      for (var i = 0; i < 11; i++) {
        comment.sendKeys('Spam #' + i)
        rating.click()
        submitButton.click()
        browser.wait(EC.visibilityOf(snackBar), 200, 'SnackBar did not become visible')
        snackBar.click()
        browser.sleep(200)
        solveNextCaptcha() // first CAPTCHA was already solved in beforeEach
      }

      browser.waitForAngularEnabled(true)
    })

    // protractor.expect.challengeSolved({ challenge: 'CAPTCHA Bypass' })
  })

  describe('challenge "supplyChainAttack"', () => {
    it('should be possible to post GitHub issue URL reporting malicious eslint-scope package as feedback', () => {
      comment.sendKeys('Turn on 2FA! Now!!! https://github.com/eslint/eslint-scope/issues/39')
      rating.click()

      submitButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Supply Chain Attack' })
  })

  describe('challenge "dlpPastebinDataLeak"', () => {
    it('should be possible to post dangerous ingredients of unsafe product as feedback', () => {
      comment.sendKeys(pastebinLeakProduct.keywordsForPastebinDataLeakChallenge.toString())
      rating.click()
      submitButton.click()
    })
    protractor.expect.challengeSolved({ challenge: 'Leaked Unsafe Product' })
  })

  function solveNextCaptcha () {
    element(by.id('captcha')).getText().then((text) => {
      captcha.clear()
      const answer = eval(text).toString() // eslint-disable-line no-eval
      captcha.sendKeys(answer)
    })
  }
})
