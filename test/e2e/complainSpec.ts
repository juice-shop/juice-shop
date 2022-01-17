/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
import { browser, by, element, ElementFinder, protractor } from 'protractor'
import { basePath, beforeEachLogin, expectChallengeSolved } from './e2eHelpers'

const config = require('config')
const utils = require('../../lib/utils')

describe('/#/complain', () => {
  let file: ElementFinder, complaintMessage: ElementFinder, submitButton: ElementFinder

  beforeEachLogin({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

  beforeEach(() => {
    void browser.get(`${basePath}/#/complain`)
    file = element(by.id('file'))
    complaintMessage = element(by.id('complaintMessage'))
    submitButton = element(by.id('submitButton'))
  })

  describe('challenge "uploadSize"', () => {
    it('should be possible to upload files greater 100 KB directly through backend', () => {
      void browser.waitForAngularEnabled(false)
      void browser.executeScript((baseUrl: string) => {
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
    expectChallengeSolved({ challenge: 'Upload Size' })
  })

  describe('challenge "uploadType"', () => {
    it('should be possible to upload files with other extension than .pdf directly through backend', () => {
      void browser.waitForAngularEnabled(false)
      void browser.executeScript((baseUrl: string) => {
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
    expectChallengeSolved({ challenge: 'Upload Type' })
  })

  describe('challenge "deprecatedInterface"', () => {
    it('should be possible to upload XML files', () => {
      void complaintMessage.sendKeys('XML all the way!')
      void file.sendKeys(path.resolve('test/files/deprecatedTypeForServer.xml'))
      void submitButton.click()
    })
    expectChallengeSolved({ challenge: 'Deprecated Interface' })
  })

  if (!utils.disableOnContainerEnv()) {
    describe('challenge "xxeFileDisclosure"', () => {
      it('should be possible to retrieve file from Windows server via .xml upload with XXE attack', () => {
        void complaintMessage.sendKeys('XXE File Exfiltration Windows!')
        void file.sendKeys(path.resolve('test/files/xxeForWindows.xml'))
        void submitButton.click()
      })

      it('should be possible to retrieve file from Linux server via .xml upload with XXE attack', () => {
        void complaintMessage.sendKeys('XXE File Exfiltration Linux!')
        void file.sendKeys(path.resolve('test/files/xxeForLinux.xml'))
        void submitButton.click()
      })

      afterAll(() => {
        expectChallengeSolved({ challenge: 'XXE Data Access' })
      })
    })

    describe('challenge "xxeDos"', () => {
      it('should be possible to trigger request timeout via .xml upload with Quadratic Blowup attack', () => {
        void complaintMessage.sendKeys('XXE Quadratic Blowup!')
        void file.sendKeys(path.resolve('test/files/xxeQuadraticBlowup.xml'))
        void submitButton.click()
      })

      it('should be possible to trigger request timeout via .xml upload with dev/random attack', () => {
        void complaintMessage.sendKeys('XXE Quadratic Blowup!')
        void file.sendKeys(path.resolve('test/files/xxeDevRandom.xml'))
        void submitButton.click()
      })

      afterAll(() => {
        expectChallengeSolved({ challenge: 'XXE DoS' })
      })
    })

    describe('challenge "arbitraryFileWrite"', () => {
      it('should be possible to upload zip file with filenames having path traversal', () => {
        void complaintMessage.sendKeys('Zip Slip!')
        void file.sendKeys(path.resolve('test/files/arbitraryFileWrite.zip'))
        void submitButton.click()
      })
      expectChallengeSolved({ challenge: 'Arbitrary File Write' })
    })

    describe('challenge "videoXssChallenge"', () => {
      it('should be possible to inject js in subtitles by uploading zip file with filenames having path traversal', () => {
        const EC = protractor.ExpectedConditions
        void complaintMessage.sendKeys('Here we go!')
        void file.sendKeys(path.resolve('test/files/videoExploit.zip'))
        void submitButton.click()
        void browser.waitForAngularEnabled(false)
        void browser.get(`${basePath}/promotion`)
        void browser.wait(EC.alertIsPresent(), 5000, "'xss' alert is not present on /promotion")
        void browser.switchTo().alert().then(alert => {
          expect(alert.getText()).toEqual(Promise.resolve('xss'))
          void alert.accept()
        })
        void browser.get(`${basePath}/`)
        void browser.driver.sleep(5000)
        void browser.waitForAngularEnabled(true)
      })
      expectChallengeSolved({ challenge: 'Video XSS' })
    })
  }
})
