/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { browser, protractor } from 'protractor'
import utils = require('../../lib/utils')
import { basePath, expectChallengeSolved } from './e2eHelpers'

describe('/#/track-order', () => {
  if (!utils.disableOnContainerEnv()) {
    describe('challenge "reflectedXss"', () => {
      it('Order Id should be susceptible to reflected XSS attacks', () => {
        const EC = protractor.ExpectedConditions

        void browser.get(`${basePath}/#/track-result`)
        void browser.waitForAngularEnabled(false)
        void browser.get(`${basePath}/#/track-result?id=<iframe src="javascript:alert(\`xss\`)">`)
        void browser.refresh()

        void browser.wait(EC.alertIsPresent(), 5000, "'xss' alert is not present on /#/track-result ")
        void browser.switchTo().alert().then(alert => {
          expect(alert.getText()).toEqual('xss')
          void alert.accept()
        })
        void browser.waitForAngularEnabled(true)
      })

      expectChallengeSolved({ challenge: 'Reflected XSS' })
    })
  }
})
