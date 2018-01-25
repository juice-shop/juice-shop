const frisby = require('frisby')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')

const URL = 'http://localhost:3000'

describe('/file-upload', () => {
  let file, form

  it('POST file valid PDF for client and API', done => {
    file = path.resolve(__dirname, '../files/validSizeAndTypeForClient.pdf')
    form = new FormData()
    form.append('file', fs.createReadStream(file))

    frisby.post(URL + '/file-upload', { headers: form.getHeaders(), body: form })
      .expect('status', 204)
      .done(done)
  })

  it('POST file too large for client validation but valid for API', done => {
    file = path.resolve(__dirname, '../files/invalidSizeForClient.pdf')
    form = new FormData()
    form.append('file', fs.createReadStream(file))

    frisby.post(URL + '/file-upload', { headers: form.getHeaders(), body: form })
      .expect('status', 204)
      .done(done)
  })

  it('POST file with illegal type for client validation but valid for API', done => {
    file = path.resolve(__dirname, '../files/invalidTypeForClient.exe')
    form = new FormData()
    form.append('file', fs.createReadStream(file))

    frisby.post(URL + '/file-upload', { headers: form.getHeaders(), body: form })
      .expect('status', 204)
      .done(done)
  })

  it('POST file type XML deprecated for API', done => {
    file = path.resolve(__dirname, '../files/deprecatedTypeForServer.xml')
    form = new FormData()
    form.append('file', fs.createReadStream(file))

    frisby.post(URL + '/file-upload', { headers: form.getHeaders(), body: form })
      .expect('status', 410)
      .done(done)
  })

  if (process.platform === 'win32') {
    it('POST file type XML with XXE attack against Windows', done => {
      file = path.resolve(__dirname, '../files/xxeForWindows.xml')
      form = new FormData()
      form.append('file', fs.createReadStream(file))

      frisby.post(URL + '/file-upload', { headers: form.getHeaders(), body: form })
        .expect('status', 410)
        .done(done)
    })
  }

  if (process.platform === 'linux' || process.platform === 'darwin') {
    it('POST file type XML with XXE attack against Linux', done => {
      file = path.resolve(__dirname, '../files/xxeForLinux.xml')
      form = new FormData()
      form.append('file', fs.createReadStream(file))

      frisby.post(URL + '/file-upload', {headers: form.getHeaders(), body: form})
        .expect('status', 410)
        .done(done)
    })
  }

  it('POST file type XML with /dev/random DoS attack responds after timeout', done => {
    file = path.resolve(__dirname, '../files/xxeDoS.xml')
    form = new FormData()
    form.append('file', fs.createReadStream(file))

    frisby.post(URL + '/file-upload', { headers: form.getHeaders(), body: form })
      .expect('status', 410)
      .done(done)
  })

  it('POST file type XML with Billion Laughs attack responds', done => {
    file = path.resolve(__dirname, '../files/xmlBillionLaughs.xml')
    form = new FormData()
    form.append('file', fs.createReadStream(file))

    frisby.post(URL + '/file-upload', { headers: form.getHeaders(), body: form })
      .expect('status', 410)
      .expect('bodyContains', 'Detected an entity reference loop')
      .done(done)
  })

  it('POST file too large for API', done => {
    file = path.resolve(__dirname, '../files/invalidSizeForServer.pdf')
    form = new FormData()
    form.append('file', fs.createReadStream(file))

    frisby.post(URL + '/file-upload', { headers: form.getHeaders(), body: form })
      .expect('status', 500)
      .done(done)
  })
})
