'use strict'

describe('/#/complain', function () {
  var path = require('path')
  var message, file, submitButton

  protractor.beforeEach.login({ email: 'admin@juice-sh.op', password: 'admin123' })

  beforeEach(function () {
    browser.get('/#/complain')
    message = element(by.model('complaint.message'))
    file = element(by.model('file'))
    submitButton = element(by.id('submitButton'))
  })

  describe('untampered file upload form', function () {
    it('can handle PDFs smaller than 1 MB regularly', function () {
      var filename = path.resolve(__dirname, 'files/validSizeAndTypeForClient.pdf')
      console.log(filename)

      message.sendKeys('Uploading small PDF attachment...')
      file.sendKeys(filename)

      expect(submitButton.isEnabled()).toBe(true)
      submitButton.click()
    })

    it('should not be possible to upload files greater 1 MB', function () {
      var filename = path.resolve(__dirname, 'files/invalidSizeForClient.pdf')
      console.log(filename)

      message.sendKeys('Cannot upload 1.5 MB attachment!')
      file.sendKeys(filename)

      expect(submitButton.isEnabled()).toBe(false)
    })

    it('should not be possible to upload files with other extension than .pdf', function () {
      var filename = path.resolve(__dirname, 'files/invalidTypeForClient.qeg')
      console.log(filename)

      message.sendKeys('Cannot upload .qeg attachment!')
      file.sendKeys(filename)

      expect(submitButton.isEnabled()).toBe(false)
    })
  })

  describe('challenge "uploadSize"', function () {
    xit('should be possible to upload files greater 1 MB', function () {
      browser.executeScript('document.getElementById("file").removeAttribute("ngf-max-size");')
      var filename = path.resolve(__dirname, 'files/invalidSizeForClient.pdf')
      console.log(filename)

      message.sendKeys('Uploading 1.5 MB attachment...')
      file.sendKeys(filename)

      expect(submitButton.isEnabled()).toBe(true)
      submitButton.click()

      protractor.expect.challengeSolved({ challenge: 'uploadSize' })
    })

  })

  describe('challenge "uploadType"', function () {
    xit('should be possible to upload files with other extension than .pdf', function () {
      browser.executeScript('document.getElementById("file").removeAttribute("ngf-pattern");')
      browser.executeScript('document.getElementById("file").removeAttribute("accept");')
      var filename = path.resolve(__dirname, 'files/invalidTypeForClient.qeg')
      console.log(filename)

      message.sendKeys('Uploading .qeg attachment...')
      file.sendKeys(filename)

      expect(submitButton.isEnabled()).toBe(true)
      submitButton.click()

      protractor.expect.challengeSolved({ challenge: 'uploadType' })
    })

  })
})
