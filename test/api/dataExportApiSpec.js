const frisby = require('frisby')
const REST_URL = 'http://localhost:3000/rest'

const jsonHeader = { 'content-type': 'application/json' }

describe('/rest/data-export', () => {
  it('Export data without use of CAPTCHA', () => {
    return frisby.timeout(10000).post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'bW9jLmxpYW1lbGdvb2dAaGNpbmltbWlrLm5yZW9qYg=='
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/data-export', {
          headers: { 'Authorization': 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
          body: {
            format: '1'
          }
        })
          .expect('status', 200)
          .expect('header', 'content-type', /application\/json/)
          .expect('json', 'confirmation', 'Your data export will open in a new Browser window.')
          // eslint-disable-next-line
          .expect('json', 'userData', '{\n  \"username\": \"\",\n  \"email\": \"bjoern.kimminich@googlemail.com\"\n}')
      })
  })

  it('Export data when CAPTCHA requested need right answer', () => {
    return frisby.timeout(10000).post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'bW9jLmxpYW1lbGdvb2dAaGNpbmltbWlrLm5yZW9qYg=='
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get(REST_URL + '/image-captcha', {
          headers: { 'Authorization': 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
          .expect('header', 'content-type', /application\/json/)
          .then(() => {
            return frisby.post(REST_URL + '/data-export', {
              headers: { 'Authorization': 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
              body: {
                answer: 'AAAAAA',
                format: 1
              }
            })
              .expect('status', 401)
              .expect('bodyContains', 'Wrong answer to CAPTCHA. Please try again.')
          })
      })
  })

  it('Export data using right answer to CAPTCHA', () => {
    return frisby.timeout(10000).post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'bW9jLmxpYW1lbGdvb2dAaGNpbmltbWlrLm5yZW9qYg=='
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get(REST_URL + '/image-captcha', {
          headers: { 'Authorization': 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
          .expect('header', 'content-type', /application\/json/)
          .then(({ json: captchaAnswer }) => {
            return frisby.post(REST_URL + '/data-export', {
              headers: { 'Authorization': 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
              body: {
                answer: captchaAnswer.answer,
                format: 1
              }
            })
              .expect('status', 200)
              .expect('header', 'content-type', /application\/json/)
              .expect('json', 'confirmation', 'Your data export will open in a new Browser window.')
              // eslint-disable-next-line
              .expect('json', 'userData', '{\n  \"username\": \"\",\n  \"email\": \"bjoern.kimminich@googlemail.com\"\n}')
          })
      })
  })
})
