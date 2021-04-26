/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import utils = require('../../lib/utils')

describe('/#/track-order', () => {
  if (!utils.disableOnContainerEnv()) {
    describe('challenge "reflectedXss"', () => {
      it('Order Id should be susceptible to reflected XSS attacks', () => {
        const EC = protractor.ExpectedConditions

        browser.get(`${protractor.basePath}/#/track-result`)
        browser.waitForAngularEnabled(false)
        browser.get(`${protractor.basePath}/#/track-result?id=<iframe src="javascript:alert(\`xss\`)">`)
        browser.refresh()

        browser.wait(EC.alertIsPresent(), 5000, "'xss' alert is not present on /#/track-result ")
        browser.switchTo().alert().then(alert => {
          expect(alert.getText()).toEqual('xss')
          alert.accept()
        })
        browser.waitForAngularEnabled(true)
      })

      protractor.expect.challengeSolved({ challenge: 'Reflected XSS' })
    })
  }
})
