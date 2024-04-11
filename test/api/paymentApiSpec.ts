/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const jsonHeader = { 'content-type': 'application/json' }
let authHeader: { Authorization: string, 'content-type': string }
let cardId: number

beforeAll(() => {
  return frisby.post(REST_URL + '/user/login', {
    headers: jsonHeader,
    body: {
      email: 'jim@juice-sh.op',
      password: 'ncc-1701'
    }
  })
    .expect('status', 200)
    .then(({ json }) => {
      authHeader = { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
    })
})

describe('/api/Cards', () => {
  it('GET all cards is forbidden via public API', () => {
    return frisby.get(API_URL + '/Cards')
      .expect('status', 401)
  })

  it('GET all cards', () => {
    return frisby.get(API_URL + '/Cards', { headers: authHeader })
      .expect('status', 200)
  })

  it('POST new card is forbidden via public API', () => {
    return frisby.post(API_URL + '/Cards', {
      fullName: 'Jim',
      cardNum: 12345678876543210,
      expMonth: 1,
      expYear: new Date().getFullYear()
    })
      .expect('status', 401)
  })

  it('POST new card with all valid fields', () => {
    return frisby.post(API_URL + '/Cards', {
      headers: authHeader,
      body: {
        fullName: 'Jim',
        cardNum: 1234567887654321,
        expMonth: 1,
        expYear: 2085
      }
    })
      .expect('status', 201)
  })

  it('POST new card with invalid card number', () => {
    return frisby.post(API_URL + '/Cards', {
      headers: authHeader,
      body: {
        fullName: 'Jim',
        cardNum: 12345678876543210,
        expMonth: 1,
        expYear: new Date().getFullYear()
      }
    })
      .expect('status', 400)
  })

  it('POST new card with invalid expMonth', () => {
    return frisby.post(API_URL + '/Cards', {
      headers: authHeader,
      body: {
        fullName: 'Jim',
        cardNum: 1234567887654321,
        expMonth: 13,
        expYear: new Date().getFullYear()
      }
    })
      .expect('status', 400)
  })

  it('POST new card with invalid expYear', () => {
    return frisby.post(API_URL + '/Cards', {
      headers: authHeader,
      body: {
        fullName: 'Jim',
        cardNum: 1234567887654321,
        expMonth: 1,
        expYear: 2015
      }
    })
      .expect('status', 400)
  })
})

describe('/api/Cards/:id', () => {
  beforeAll(() => {
    return frisby.post(API_URL + '/Cards', {
      headers: authHeader,
      body: {
        fullName: 'Jim',
        cardNum: 1234567887654321,
        expMonth: 1,
        expYear: 2088
      }
    })
      .expect('status', 201)
      .then(({ json }) => {
        cardId = json.data.id
      })
  })

  it('GET card by id is forbidden via public API', () => {
    return frisby.get(API_URL + '/Cards/' + cardId)
      .expect('status', 401)
  })

  it('PUT update card is forbidden via public API', () => {
    return frisby.put(API_URL + '/Cards/' + cardId, {
      quantity: 2
    }, { json: true })
      .expect('status', 401)
  })

  it('DELETE card by id is forbidden via public API', () => {
    return frisby.del(API_URL + '/Cards/' + cardId)
      .expect('status', 401)
  })

  it('GET card by id', () => {
    return frisby.get(API_URL + '/Cards/' + cardId, { headers: authHeader })
      .expect('status', 200)
  })

  it('PUT update card by id is forbidden via authorized API call', () => {
    return frisby.put(API_URL + '/Cards/' + cardId, {
      headers: authHeader,
      body: {
        fullName: 'Jimy'
      }
    }, { json: true })
      .expect('status', 401)
  })

  it('DELETE card by id', () => {
    return frisby.del(API_URL + '/Cards/' + cardId, { headers: authHeader })
      .expect('status', 200)
  })
})
