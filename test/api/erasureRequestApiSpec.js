const frisby = require('frisby')

const jsonHeader = { 'content-type': 'application/json' }
const REST_URL = 'http://localhost:3000/rest'

describe('/rest/user/erasure-request', () => {
  it('Erasure request does not actually delete the user', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@gmail.com',
        password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/user/erasure-request', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token }
        })
          .expect('status', 202)
          .then(() => {
            return frisby.post(REST_URL + '/user/login', {
              headers: jsonHeader,
              body: {
                email: 'bjoern.kimminich@gmail.com',
                password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
              }
            })
              .expect('status', 200)
          })
      })
  })
})
