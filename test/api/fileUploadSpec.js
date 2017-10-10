const frisby = require('frisby')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')

const URL = 'http://localhost:3000'

// FIXME Adapt to solution of https://github.com/vlucas/frisby/issues/372
describe('/file-upload', () => {
  let file, form

  it('POST file valid for client and API', done => {
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

  it('POST file too large for API', done => {
    file = path.resolve(__dirname, '../files/invalidSizeForServer.pdf')
    form = new FormData()
    form.append('file', fs.createReadStream(file))

    frisby.post(URL + '/file-upload', { headers: form.getHeaders(), body: form })
      .expect('status', 500)
      .done(done)
  })
})
