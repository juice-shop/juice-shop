/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
import * as security from '../../lib/insecurity'

const Joi = frisby.Joi

const REST_URL = 'http://localhost:3000/rest'

const authHeader = { Authorization: `Bearer ${security.authorize()}`, 'content-type': 'application/json' }

describe('/rest/user/authentication-details', () => {
  it('GET all users decorated with attribute for authentication token', () => {
    return frisby.get(`${REST_URL}/user/authentication-details`, { headers: authHeader })
      .expect('status', 200)
      .expect('jsonTypes', 'data.?', {
        token: Joi.string()
      })
  })

  it('GET all users with password replaced by asterisks', () => {
    return frisby.get(`${REST_URL}/user/authentication-details`, { headers: authHeader })
      .expect('status', 200)
      .expect('json', 'data.?', {
        password: '********************************'
      })
  })
})
