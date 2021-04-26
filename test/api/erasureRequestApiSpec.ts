/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')

const jsonHeader = { 'content-type': 'application/json' }
const BASE_URL = 'http://localhost:3000'
const REST_URL = 'http://localhost:3000/rest'

describe('/dataerasure', () => {
  it('Erasure request does not actually delete the user', () => {
    const form = frisby.formData()
    form.append('email', 'bjoern.kimminich@gmail.com')

    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@gmail.com',
        password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(BASE_URL + '/dataerasure/', {
          headers: { Cookie: 'token=' + jsonLogin.authentication.token },
          body: form
        })
          .expect('status', 200)
          .expect('header', 'Content-Type', 'text/html; charset=utf-8')
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
