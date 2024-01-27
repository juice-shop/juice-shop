/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
const Joi = frisby.Joi
const security = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'

const authHeader = { Authorization: 'Bearer ' + security.authorize(), 'content-type': 'application/json' }

describe('/api/PrivacyRequests', () => {
  it('POST new complaint', () => {
    return frisby.post(API_URL + '/PrivacyRequests', {
      headers: authHeader,
      body: {
        UserId: 1,
        deletionRequested: false
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

  it('GET all privacy requests is forbidden via public API', () => {
    return frisby.get(API_URL + '/PrivacyRequests')
      .expect('status', 401)
  })
})

describe('/api/PrivacyRequests/:id', () => {
  it('GET all privacy requests is forbidden', () => {
    return frisby.get(API_URL + '/PrivacyRequests', { headers: authHeader })
      .expect('status', 401)
  })

  it('GET existing privacy request by id is forbidden', () => {
    return frisby.get(API_URL + '/PrivacyRequests/1', { headers: authHeader })
      .expect('status', 401)
  })

  it('PUT update existing privacy request is forbidden', () => {
    return frisby.put(API_URL + '/PrivacyRequests/1', {
      headers: authHeader,
      body: {
        message: 'Should not work...'
      }
    })
      .expect('status', 401)
  })

  it('DELETE existing privacy request is forbidden', () => {
    return frisby.del(API_URL + '/PrivacyRequests/1', { headers: authHeader })
      .expect('status', 401)
  })
})
