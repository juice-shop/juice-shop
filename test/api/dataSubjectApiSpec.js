const frisby = require('frisby')

const jsonHeader = { 'content-type': 'application/json' }
const REST_URL = 'http://localhost:3000/rest'

xdescribe('/rest/data-subject', () => { // FIXME or delete as test expectation is entirely unclear
  it('Delete user profile of a logged in user', () => {
    return frisby.timeout(10000).post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'bW9jLmxpYW1lbGdvb2dAaGNpbmltbWlrLm5yZW9qYg=='
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.timeout(10000).get(REST_URL + '/data-subject', {
          headers: { 'Authorization': 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json', 'Cookie': jsonLogin.cookies.token }
        })
          .expect('status', 200)
          .then(() => {
            return frisby.timeout(10000).post(REST_URL + '/user/login', {
              headers: jsonHeader,
              body: {
                email: 'bjoern.kimminich@googlemail.com',
                password: 'bW9jLmxpYW1lbGdvb2dAaGNpbmltbWlrLm5yZW9qYg=='
              }
            })
              .expect('status', 200)
          })
      })
  })
})
