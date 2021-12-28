/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
const config = require('config')

const jsonHeader = { 'content-type': 'application/json' }
const REST_URL = 'http://localhost:3000/rest'

describe('/rest/order-history', () => {
  it('GET own previous orders', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'admin@' + config.get('application.domain'),
        password: 'admin123'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get(REST_URL + '/order-history', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
          .then(({ json }) => {
            expect(json.data[0].totalPrice).toBe(8.96)
            expect(json.data[0].delivered).toBe(false)
            expect(json.data[0].products[0].quantity).toBe(3)
            expect(json.data[0].products[0].name).toBe('Apple Juice (1000ml)')
            expect(json.data[0].products[0].price).toBe(1.99)
            expect(json.data[0].products[0].total).toBe(5.97)
            expect(json.data[0].products[1].quantity).toBe(1)
            expect(json.data[0].products[1].name).toBe('Orange Juice (1000ml)')
            expect(json.data[0].products[1].price).toBe(2.99)
            expect(json.data[0].products[1].total).toBe(2.99)
            expect(json.data[1].totalPrice).toBe(26.97)
            expect(json.data[1].delivered).toBe(true)
            expect(json.data[1].products[0].quantity).toBe(3)
            expect(json.data[1].products[0].name).toBe('Eggfruit Juice (500ml)')
            expect(json.data[1].products[0].price).toBe(8.99)
            expect(json.data[1].products[0].total).toBe(26.97)
          })
      })
  })
})

describe('/rest/order-history/orders', () => {
  it('GET all orders is forbidden for customers', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get(REST_URL + '/order-history/orders', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 403)
      })
  })

  it('GET all orders is forbidden for admin', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'admin@' + config.get('application.domain'),
        password: 'admin123'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get(REST_URL + '/order-history/orders', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 403)
      })
  })

  it('GET all orders for accountant', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'accountant@' + config.get('application.domain'),
        password: 'i am an awesome accountant'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get(REST_URL + '/order-history/orders', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
      })
  })
})

describe('/rest/order-history/:id/delivery-status', () => {
  it('PUT delivery status is forbidden for admin', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'admin@' + config.get('application.domain'),
        password: 'admin123'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.put(REST_URL + '/order-history/1/delivery-status', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
          body: {
            delivered: false
          }
        })
          .expect('status', 403)
      })
  })

  it('PUT delivery status is forbidden for customer', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.put(REST_URL + '/order-history/1/delivery-status', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
          body: {
            delivered: false
          }
        })
          .expect('status', 403)
      })
  })

  it('PUT delivery status is allowed for accountant', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'accountant@' + config.get('application.domain'),
        password: 'i am an awesome accountant'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.put(REST_URL + '/order-history/1/delivery-status', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
          body: {
            delivered: false
          }
        })
          .expect('status', 200)
      })
  })
})
