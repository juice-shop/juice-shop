const frisby = require('frisby')
const config = require('config')
const path = require('path')
const fs = require('fs')

const jsonHeader = { 'content-type': 'application/json' }
const REST_URL = 'http://localhost:3000/rest'
const API_URL = 'http://localhost:3000/api'

describe('/api/Memorys', () => {
  it('GET memories via public API', () => {
    return frisby.get(API_URL + '/Memorys')
      .expect('status', 200)
  })

  it('GET memories via a valid authorization token', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get(API_URL + '/Memorys', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
      })
  })

  it('POST new memory is forbidden via public API', () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')
    const form = frisby.formData()
    form.append('image', fs.createReadStream(file), 'Valid Image')
    form.append('caption', 'Valid Image')

    return frisby.post(API_URL + '/Memorys', {
      headers: {
        'Content-Type': form.getHeaders()['content-type']
      },
      body: form
    })
      .expect('status', 401)
  })

  it('POST new memory image file invalid type', () => {
    const file = path.resolve(__dirname, '../files/invalidProfileImageType.docx')
    const form = frisby.formData()
    form.append('image', fs.createReadStream(file), 'Valid Image')
    form.append('caption', 'Valid Image')

    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(API_URL + '/Memorys', {
          headers: {
            Authorization: 'Bearer ' + jsonLogin.authentication.token,
            'Content-Type': form.getHeaders()['content-type']
          },
          body: form
        })
          .expect('status', 500)
      })
  })

  it('POST new memory with valid for JPG format image', () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')
    const form = frisby.formData()
    form.append('image', fs.createReadStream(file), 'Valid Image')
    form.append('caption', 'Valid Image')

    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(API_URL + '/Memorys', {
          headers: {
            Authorization: 'Bearer ' + jsonLogin.authentication.token,
            'Content-Type': form.getHeaders()['content-type']
          },
          body: form
        })
          .expect('status', 200)
          .then(({ json }) => {
            expect(json.data.caption).toBe('Valid Image')
            expect(json.data.UserId).toBe(2)
          })
      })
  })
})
