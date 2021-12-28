/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
import { by, element, browser, protractor } from 'protractor'
const config = require('config')
const utils = require('../../lib/utils')

describe('/#/complain', () => {
  let file, complaintMessage, submitButton

  protractor.beforeEach.login({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

  beforeEach(() => {
    void browser.get(`${protractor.basePath}/#/complain`)
    file = element(by.id('file'))
    complaintMessage = element(by.id('complaintMessage'))
    submitButton = element(by.id('submitButton'))
  })

  describe('challenge "uploadSize"', () => {
    it('should be possible to upload files greater 100 KB directly through backend', () => {
      void browser.waitForAngularEnabled(false)
      void browser.executeScript(baseUrl => {
        const over100KB = Array.apply(null, new Array(11000)).map(String.prototype.valueOf, '1234567890')
        const blob = new Blob(over100KB, { type: 'application/pdf' })

        const data = new FormData()
        data.append('file', blob, 'invalidSizeForClient.pdf')

        const request = new XMLHttpRequest()
        request.open('POST', `${baseUrl}/file-upload`)
        request.send(data)
      }, browser.baseUrl)
      void browser.driver.sleep(1000)
      void browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'Upload Size' })
  })

  describe('challenge "uploadType"', () => {
    it('should be possible to upload files with other extension than .pdf directly through backend', () => {
      void browser.waitForAngularEnabled(false)
      void browser.executeScript(baseUrl => {
        const data = new FormData()
        const blob = new Blob(['test'], { type: 'application/x-msdownload' })
        data.append('file', blob, 'invalidTypeForClient.exe')

        const request = new XMLHttpRequest()
        request.open('POST', `${baseUrl}/file-upload`)
        request.send(data)
      }, browser.baseUrl)
      void browser.driver.sleep(1000)
      void browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'Upload Type' })
  })

  describe('challenge "deprecatedInterface"', () => {
    it('should be possible to upload XML files', () => {
      complaintMessage.sendKeys('XML all the way!')
      file.sendKeys(path.resolve('test/files/deprecatedTypeForServer.xml'))
      submitButton.click()
    })
    protractor.expect.challengeSolved({ challenge: 'Deprecated Interface' })
  })

  if (!utils.disableOnContainerEnv()) {
    describe('challenge "xxeFileDisclosure"', () => {
      it('should be possible to retrieve file from Windows server via .xml upload with XXE attack', () => {
        complaintMessage.sendKeys('XXE File Exfiltration Windows!')
        file.sendKeys(path.resolve('test/files/xxeForWindows.xml'))
        submitButton.click()
      })

      it('should be possible to retrieve file from Linux server via .xml upload with XXE attack', () => {
        complaintMessage.sendKeys('XXE File Exfiltration Linux!')
        file.sendKeys(path.resolve('test/files/xxeForLinux.xml'))
        submitButton.click()
      })

      afterAll(() => {
        protractor.expect.challengeSolved({ challenge: 'XXE Data Access' })
      })
    })

    describe('challenge "xxeDos"', () => {
      it('should be possible to trigger request timeout via .xml upload with Quadratic Blowup attack', () => {
        complaintMessage.sendKeys('XXE Quadratic Blowup!')
        file.sendKeys(path.resolve('test/files/xxeQuadraticBlowup.xml'))
        submitButton.click()
      })

      it('should be possible to trigger request timeout via .xml upload with dev/random attack', () => {
        complaintMessage.sendKeys('XXE Quadratic Blowup!')
        file.sendKeys(path.resolve('test/files/xxeDevRandom.xml'))
        submitButton.click()
      })

      afterAll(() => {
        protractor.expect.challengeSolved({ challenge: 'XXE DoS' })
      })
    })

    describe('challenge "arbitraryFileWrite"', () => {
      it('should be possible to upload zip file with filenames having path traversal', () => {
        complaintMessage.sendKeys('Zip Slip!')
        file.sendKeys(path.resolve('test/files/arbitraryFileWrite.zip'))
        submitButton.click()
      })
      protractor.expect.challengeSolved({ challenge: 'Arbitrary File Write' })
    })

    describe('challenge "videoXssChallenge"', () => {
      it('should be possible to inject js in subtitles by uploading zip file with filenames having path traversal', () => {
        const EC = protractor.ExpectedConditions
        complaintMessage.sendKeys('Here we go!')
        file.sendKeys(path.resolve('test/files/videoExploit.zip'))
        submitButton.click()
        void browser.waitForAngularEnabled(false)
        void browser.get(`${protractor.basePath}/promotion`)
        void browser.wait(EC.alertIsPresent(), 5000, "'xss' alert is not present on /promotion")
        void browser.switchTo().alert().then(alert => {
          expect(alert.getText()).toEqual('xss')
          void alert.accept()
        })
        void browser.get(`${protractor.basePath}/`)
        void browser.driver.sleep(5000)
        void browser.waitForAngularEnabled(true)
      })
      protractor.expect.challengeSolved({ challenge: 'Video XSS' })
    })
  }
})
