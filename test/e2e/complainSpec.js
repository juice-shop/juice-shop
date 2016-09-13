'use strict'

describe('/#/contact', function () {
  var path = require('path')
  var message, file, submitButton

  protractor.beforeEach.login({ email: 'admin@juice-sh.op', password: 'admin123' })

  beforeEach(function () {
    browser.get('/#/complain')
    message = element(by.model('complaint.message'))
    file = element(by.model('file'))
    submitButton = element(by.id('submitButton'))
  })

  describe('challenge "uploadSize"', function () {
    xit('should be possible to upload files greater 1 MB', function () {
      browser.executeScript('document.getElementById("file").removeAttribute("ngf-max-size");')
      var filename = path.resolve(__dirname, 'files/exceedingClientSizeLimit.pdf')
      console.log(filename)

      message.sendKeys('Uploading 1.5 MB attachment...')
      file.sendKeys(filename)

      submitButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'uploadSize' })
  })

  describe('challenge "uploadType"', function () {
    xit('should be possible to upload files with other extension than .pdf', function () {
      browser.executeScript('document.getElementById("file").removeAttribute("ngf-pattern");')
      browser.executeScript('document.getElementById("file").removeAttribute("accept");')
      var filename = path.resolve(__dirname, 'files/illegalFileType.html')
      console.log(filename)

      message.sendKeys('Uploading .exe attachment...')
      file.sendKeys(filename)

      submitButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'uploadType' })
  })
})
