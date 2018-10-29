const frisby = require('frisby')
const fs = require('fs')
const path = require('path')
const utils = require('../../lib/utils')

const URL = 'http://localhost:3000'

describe('/file-upload', () => {
  let file
  let form

  it('POST file valid PDF for client and API', () => {
    file = path.resolve(__dirname, '../files/validSizeAndTypeForClient.pdf')
    form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 204)
  })

  it('POST file too large for client validation but valid for API', () => {
    file = path.resolve(__dirname, '../files/invalidSizeForClient.pdf')
    form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 204)
  })

  it('POST file with illegal type for client validation but valid for API', () => {
    file = path.resolve(__dirname, '../files/invalidTypeForClient.exe')
    form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 204)
  })

  it('POST file type XML deprecated for API', () => {
    file = path.resolve(__dirname, '../files/deprecatedTypeForServer.xml')
    form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 410)
  })

  it('POST large XML file near upload size limit', () => {
    file = path.resolve(__dirname, '../files/maxSizeForServer.xml')
    form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 410)
  })

  if (!utils.disableOnContainerEnv()) {
    it('POST file type XML with XXE attack against Windows', () => {
      file = path.resolve(__dirname, '../files/xxeForWindows.xml')
      form = frisby.formData()
      form.append('file', fs.createReadStream(file))

      return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
        .expect('status', 410)
    })

    it('POST file type XML with XXE attack against Linux', () => {
      file = path.resolve(__dirname, '../files/xxeForLinux.xml')
      form = frisby.formData()
      form.append('file', fs.createReadStream(file))

      return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
        .expect('status', 410)
    })

    it('POST file type XML with Billion Laughs attack is caught by parser', () => {
      file = path.resolve(__dirname, '../files/xxeBillionLaughs.xml')
      form = frisby.formData()
      form.append('file', fs.createReadStream(file))

      return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
        .expect('status', 410)
        .expect('bodyContains', 'Detected an entity reference loop')
    })

    xit('POST file type XML with Quadratic Blowup attack', () => {
      file = path.resolve(__dirname, '../files/xxeQuadraticBlowup.xml')
      form = frisby.formData()
      form.append('file', fs.createReadStream(file))

      return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
        .expect('status', 503)
    })

    it('POST file type XML with dev/random attack', () => {
      file = path.resolve(__dirname, '../files/xxeDevRandom.xml')
      form = frisby.formData()
      form.append('file', fs.createReadStream(file))

      return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
    })
  }

  it('POST file too large for API', () => {
    file = path.resolve(__dirname, '../files/invalidSizeForServer.pdf')
    form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 500)
  })

  xit('POST zip file with directory traversal payload', () => {
    file = path.resolve(__dirname, '../files/arbitraryFileWrite.zip')
    form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 204)
  })
})
