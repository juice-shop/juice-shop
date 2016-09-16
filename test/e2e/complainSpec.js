'use strict'

describe('/#/complain', function () {
  protractor.beforeEach.login({ email: 'admin@juice-sh.op', password: 'admin123' })

  describe('challenge "uploadSize"', function () {
    it('should be possible to upload files greater 100 KB', function () {
      browser.executeScript(function () {
        var over100KB = Array.apply(null, Array(10001)).map(String.prototype.valueOf, 'ten-bytes!')
        var blob = new Blob(over100KB, { type: 'application/pdf' })

        var data = new FormData()
        data.append('file', blob, 'invalidSizeForClient.pdf')

        var request = new XMLHttpRequest()
        request.open('POST', '/file-upload')
        request.send(data)
      })
    })
    protractor.expect.challengeSolved({ challenge: 'uploadSize' })
  })

  describe('challenge "uploadType"', function () {
    it('should be possible to upload files with other extension than .pdf', function () {
      browser.executeScript(function () {
        var data = new FormData()
        var blob = new Blob([ 'test' ], { type: 'application/x-msdownload' })
        data.append('file', blob, 'invalidTypeForClient.exe')

        var request = new XMLHttpRequest()
        request.open('POST', '/file-upload')
        request.send(data)
      })
    })
    protractor.expect.challengeSolved({ challenge: 'uploadType' })
  })
})
