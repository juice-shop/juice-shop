const config = require('config')

describe('/#/complain', () => {
  protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

  describe('challenge "uploadSize"', () => {
    it('should be possible to upload files greater 100 KB', () => {
      browser.executeScript(() => {
        const over100KB = Array.apply(null, new Array(11000)).map(String.prototype.valueOf, '1234567890')
        const blob = new Blob(over100KB, { type: 'application/pdf' })

        const data = new FormData()
        data.append('file', blob, 'invalidSizeForClient.pdf')

        const request = new XMLHttpRequest()
        request.open('POST', '/file-upload')
        request.send(data)
      })
    })
    protractor.expect.challengeSolved({ challenge: 'Upload Size' })
  })

  describe('challenge "uploadType"', () => {
    it('should be possible to upload files with other extension than .pdf', () => {
      browser.executeScript(() => {
        const data = new FormData()
        const blob = new Blob([ 'test' ], { type: 'application/x-msdownload' })
        data.append('file', blob, 'invalidTypeForClient.exe')

        const request = new XMLHttpRequest()
        request.open('POST', '/file-upload')
        request.send(data)
      })
    })
    protractor.expect.challengeSolved({ challenge: 'Upload Type' })
  })
})
