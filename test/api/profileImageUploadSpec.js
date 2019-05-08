const frisby = require('frisby')
const fs = require('fs')
const path = require('path')
const config = require('config')
const insecurity = require('../../lib/insecurity')

const URL = 'http://localhost:3000'

const Authorization = 'Bearer ' + insecurity.authorize()

describe('/profile/image/file', () => {
  it('POST profile image file valid for JPG format', () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/profile/image/file', { headers: { Authorization, 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 204)
  })

  it('POST profile image file forbidden for anonymous user', () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/profile/image/file', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>' + config.get('application.name') + ' (Express')
      .expect('bodyContains', 'Error: Blocked illegal activity')
  })
})
