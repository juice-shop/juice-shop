const config = require('config')
const path = require('path')
const utils = require('../../lib/utils')

describe('/#/complain', () => {
  let file, complaintMessage, submitButton

  protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

  beforeEach(() => {
    browser.get('/#/complain')
    file = element(by.id('file'))
    complaintMessage = element(by.id('complaintMessage'))
    submitButton = element(by.id('submitButton'))
  })

  describe('challenge "uploadSize"', () => {
    it('should be possible to upload files greater 100 KB directly through backend', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript(() => {
        const over100KB = Array.apply(null, new Array(11000)).map(String.prototype.valueOf, '1234567890')
        const blob = new Blob(over100KB, { type: 'application/pdf' })

        const data = new FormData()
        data.append('file', blob, 'invalidSizeForClient.pdf')

        const request = new XMLHttpRequest()
        request.open('POST', '/file-upload')
        request.send(data)
      })
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'Upload Size' })
  })

  describe('challenge "uploadType"', () => {
    it('should be possible to upload files with other extension than .pdf directly through backend', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript(() => {
        const data = new FormData()
        const blob = new Blob([ 'test' ], { type: 'application/x-msdownload' })
        data.append('file', blob, 'invalidTypeForClient.exe')

        const request = new XMLHttpRequest()
        request.open('POST', '/file-upload')
        request.send(data)
      })
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'Upload Type' })
  })

  describe('challenge "xxeFileDisclosure"', () => {
    it('should be possible to retrieve file from Windows server via .xml upload with XXE attack', () => {
      complaintMessage.sendKeys('XXE File Exfiltration Windows!')
      file.sendKeys(path.resolve('test/files/xxeForWindows.xml'))
      submitButton.click()
    })
    protractor.expect.challengeSolved({ challenge: 'Deprecated Interface' })
  })

  if (!utils.runsOnContainerEnv()) {
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
        protractor.expect.challengeSolved({ challenge: 'XXE Tier 1' })
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
        protractor.expect.challengeSolved({ challenge: 'XXE Tier 2' })
      })
    })
  }
})
