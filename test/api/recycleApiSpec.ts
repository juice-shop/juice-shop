/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
const Joi = frisby.Joi
const security = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'

const authHeader = { Authorization: `Bearer ${security.authorize()}`, 'content-type': 'application/json' }

describe('/api/Recycles', () => {
  it('POST new recycle', () => {
    return frisby.post(`${API_URL}/Recycles`, {
      headers: authHeader,
      body: {
        quantity: 200,
        AddressId: '1',
        isPickup: true,
        date: '2017-05-31'
      }
    })
      .expect('status', 201)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data', {
        id: Joi.number(),
        createdAt: Joi.string(),
        updatedAt: Joi.string()
      })
  })

  it('Will prevent GET all recycles from this endpoint', () => {
    return frisby.get(`${API_URL}/Recycles`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data', {
        err: 'Sorry, this endpoint is not supported.'
      })
  })

  it('Will GET existing recycle from this endpoint', () => {
    return frisby.get(`${API_URL}/Recycles/1`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', {
        id: Joi.number(),
        UserId: Joi.number(),
        AddressId: Joi.number(),
        quantity: Joi.number(),
        isPickup: Joi.boolean(),
        date: Joi.date(),
        createdAt: Joi.string(),
        updatedAt: Joi.string()
      })
  })

  it('PUT update existing recycle is forbidden', () => {
    return frisby.put(`${API_URL}/Recycles/1`, {
      headers: authHeader,
      body: {
        quantity: 100000
      }
    })
      .expect('status', 401)
  })

  it('DELETE existing recycle is forbidden', () => {
    return frisby.del(`${API_URL}/Recycles/1`, { headers: authHeader })
      .expect('status', 401)
  })
})
