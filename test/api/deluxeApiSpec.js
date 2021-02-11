/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const frisby = require('frisby')
const config = require('config')

const jsonHeader = { 'content-type': 'application/json' }
const REST_URL = 'http://localhost:3000/rest'
const API_URL = 'http://localhost:3000/api'

async function login ({ email, password, totpSecret }) {
  const loginRes = await frisby
    .post(REST_URL + '/user/login', {
      email,
      password
    }).catch((res) => {
      if (res.json && res.json.type && res.json.status === 'totp_token_required') {
        return res
      }
      throw new Error(`Failed to login '${email}'`)
    })

  return loginRes.json.authentication
}

describe('/rest/deluxe-membership', () => {
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
        return frisby.get(REST_URL + '/deluxe-membership', {
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
        return frisby.get(REST_URL + '/deluxe-membership', {
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
        return frisby.get(REST_URL + '/deluxe-membership', {
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
        return frisby.get(REST_URL + '/deluxe-membership', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 400)
          .expect('json', 'error', 'You are not eligible for deluxe membership!')
      })
  })

  it('POST upgrade deluxe membership status for customers', async () => {
    const { token } = await login({
      email: 'bender@' + config.get('application.domain'),
      password: 'OhG0dPlease1nsertLiquor!'
    })

    frisby.get(API_URL + '/Cards', {
      headers: { Authorization: 'Bearer ' + token, 'content-type': 'application/json' }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.post(REST_URL + '/deluxe-membership', {
          headers: { Authorization: 'Bearer ' + token, 'content-type': 'application/json' },
          body: {
            paymentMode: 'card',
            paymentId: json.data[0].id.toString()
          }
        })
          .expect('status', 200)
          .expect('json', 'status', 'success')
      })
  })

  it('POST deluxe membership status with wrong card id throws error', async () => {
    const { token } = await login({
      email: 'jim@' + config.get('application.domain'),
      password: 'ncc-1701'
    })

    frisby.post(REST_URL + '/deluxe-membership', {
      headers: { Authorization: 'Bearer ' + token, 'content-type': 'application/json' },
      body: {
        paymentMode: 'card',
        paymentId: 1337
      }
    })
      .expect('status', 400)
      .expect('json', 'error', 'Invalid Card')
  })

  it('POST deluxe membership status for deluxe members throws error', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'ciso@' + config.get('application.domain'),
        password: 'mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/deluxe-membership', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
          body: {
            paymentMode: 'wallet'
          }
        })
          .expect('status', 400)
          .expect('json', 'error', 'Something went wrong. Please try again!')
      })
  })

  it('POST deluxe membership status for admin throws error', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'admin@' + config.get('application.domain'),
        password: 'admin123'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/deluxe-membership', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
          body: {
            paymentMode: 'wallet'
          }
        })
          .expect('status', 400)
          .expect('json', 'error', 'Something went wrong. Please try again!')
      })
  })

  it('POST deluxe membership status for accountant throws error', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'accountant@' + config.get('application.domain'),
        password: 'i am an awesome accountant'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/deluxe-membership', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
          body: {
            paymentMode: 'wallet'
          }
        })
          .expect('status', 400)
          .expect('json', 'error', 'Something went wrong. Please try again!')
      })
  })
})
