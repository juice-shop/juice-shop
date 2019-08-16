const frisby = require('frisby')
const config = require('config')

const jsonHeader = { 'content-type': 'application/json' }
const REST_URL = 'http://localhost:3000/rest'

describe('/rest/deluxe-status', () => {
  it('GET deluxe membership status for customers', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bender@' + config.get('application.domain'),
        password: 'OhG0dPlease1nsertLiquor!'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get(REST_URL + '/deluxe-status', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
          .expect('json', 'data', { membershipCost: 49 })
      })
  })

  it('GET deluxe membership status for deluxe members throws error', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'ciso@' + config.get('application.domain'),
        password: 'mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get(REST_URL + '/deluxe-status', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 400)
          .expect('json', 'error', 'You are already a deluxe member!')
      })
  })

  it('GET deluxe membership status for admin throws error', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'admin@' + config.get('application.domain'),
        password: 'admin123'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get(REST_URL + '/deluxe-status', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 400)
          .expect('json', 'error', 'You are not eligible for deluxe membership!')
      })
  })

  it('GET deluxe membership status for accountant throws error', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'accountant@' + config.get('application.domain'),
        password: 'i am an awesome accountant'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get(REST_URL + '/deluxe-status', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 400)
          .expect('json', 'error', 'You are not eligible for deluxe membership!')
      })
  })
})

describe('/rest/upgrade-deluxe', () => {
  it('GET upgrade deluxe membership status for customers', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bender@' + config.get('application.domain'),
        password: 'OhG0dPlease1nsertLiquor!'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/upgrade-deluxe', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
          body: {
            payUsingWallet: false
          }
        })
          .expect('status', 200)
          .expect('json', 'data', { confirmation: 'Congratulations! You are now a deluxe member!' })
      })
  })

  it('GET deluxe membership status for deluxe members throws error', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'ciso@' + config.get('application.domain'),
        password: 'mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/upgrade-deluxe', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
          body: {
            payUsingWallet: false
          }
        })
          .expect('status', 400)
          .expect('json', 'error', 'Something went wrong. Please try again!')
      })
  })

  it('GET deluxe membership status for admin throws error', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'admin@' + config.get('application.domain'),
        password: 'admin123'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/upgrade-deluxe', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
          body: {
            payUsingWallet: false
          }
        })
          .expect('status', 400)
          .expect('json', 'error', 'Something went wrong. Please try again!')
      })
  })

  it('GET deluxe membership status for accountant throws error', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'accountant@' + config.get('application.domain'),
        password: 'i am an awesome accountant'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/upgrade-deluxe', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
          body: {
            payUsingWallet: false
          }
        })
          .expect('status', 400)
          .expect('json', 'error', 'Something went wrong. Please try again!')
      })
  })
})
