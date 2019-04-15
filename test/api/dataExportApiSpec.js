const frisby = require('frisby')
const config = require('config')

const jsonHeader = { 'content-type': 'application/json' }
const REST_URL = 'http://localhost:3000/rest'

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
          .then(({ json }) => {
            const parsedData = JSON.parse(json.userData)
            expect(parsedData.username).toBe('')
            expect(parsedData.email).toBe('bjoern.kimminich@googlemail.com')
          })
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
              .then(({ json }) => {
                const parsedData = JSON.parse(json.userData)
                expect(parsedData.username).toBe('')
                expect(parsedData.email).toBe('bjoern.kimminich@googlemail.com')
              })
          })
      })
  })

  it('Export data including orders without use of CAPTCHA', () => {
    return frisby.timeout(10000).post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/basket/2/checkout', {
          headers: { 'Authorization': 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
          .then(() => {
            return frisby.post(REST_URL + '/data-export', {
              headers: { 'Authorization': 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
              body: {
                format: '1'
              }
            })
              .expect('status', 200)
              .expect('header', 'content-type', /application\/json/)
              .expect('json', 'confirmation', 'Your data export will open in a new Browser window.')
              .then(({ json }) => {
                const parsedData = JSON.parse(json.userData)
                expect(parsedData.username).toBe('')
                expect(parsedData.email).toBe('jim@' + config.get('application.domain'))
                expect(parsedData.orders[0].totalPrice).toBe(9.98)
                expect(parsedData.orders[0].bonus).toBe(0)
                expect(parsedData.orders[0].products[0].quantity).toBe(2)
                expect(parsedData.orders[0].products[0].name).toBe('Raspberry Juice (1000ml)')
                expect(parsedData.orders[0].products[0].price).toBe(4.99)
                expect(parsedData.orders[0].products[0].total).toBe(9.98)
                expect(parsedData.orders[0].products[0].bonus).toBe(0)
              })
          })
      })
  })

  it('Export data including orders with use of CAPTCHA', () => {
    return frisby.timeout(10000).post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/basket/2/checkout', {
          headers: { 'Authorization': 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
          .then(() => {
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
                  .then(({ json }) => {
                    const parsedData = JSON.parse(json.userData)
                    expect(parsedData.username).toBe('')
                    expect(parsedData.email).toBe('jim@' + config.get('application.domain'))
                    expect(parsedData.orders[0].totalPrice).toBe(9.98)
                    expect(parsedData.orders[0].bonus).toBe(0)
                    expect(parsedData.orders[0].products[0].quantity).toBe(2)
                    expect(parsedData.orders[0].products[0].name).toBe('Raspberry Juice (1000ml)')
                    expect(parsedData.orders[0].products[0].price).toBe(4.99)
                    expect(parsedData.orders[0].products[0].total).toBe(9.98)
                    expect(parsedData.orders[0].products[0].bonus).toBe(0)
                  })
              })
          })
      })
  })
})
