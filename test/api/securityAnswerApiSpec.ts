/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as frisby from 'frisby'
import * as security from '../../lib/insecurity'
const Joi = frisby.Joi

const API_URL = 'http://localhost:3000/api'

const authHeader = { Authorization: `Bearer ${security.authorize()}`, 'content-type': 'application/json' }

describe('/api/SecurityAnswers', () => {
  it('GET all security answers is forbidden via public API even when authenticated', () => {
    return frisby.get(`${API_URL}/SecurityAnswers`, { headers: authHeader })
      .expect('status', 401)
  })

  it('POST new security answer for existing user fails from unique constraint', () => {
    return frisby.post(`${API_URL}/SecurityAnswers`, {
      headers: authHeader,
      body: {
        UserId: 1,
        SecurityQuestionId: 1,
        answer: 'Horst'
      }
    })
      .expect('status', 400)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'message', 'Validation error')
  })
})

describe('/api/SecurityAnswers/:id', () => {
  it('GET existing security answer by id is forbidden via public API even when authenticated', () => {
    return frisby.get(`${API_URL}/SecurityAnswers/1`, { headers: authHeader })
      .expect('status', 401)
  })

  it('POST security answer for a newly registered user', () => {
    return frisby.post(`${API_URL}/Users`, {
      email: 'new.user@te.st',
      password: '12345'
    }, { json: true })
      .expect('status', 201)
      .then(({ json }) => {
        return frisby.post(`${API_URL}/SecurityAnswers`, {
          headers: authHeader,
          body: {
            UserId: json.id,
            SecurityQuestionId: 1,
            answer: 'Horst'
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
  })

  it('PUT update existing security answer is forbidden via public API even when authenticated', () => {
    return frisby.put(`${API_URL}/SecurityAnswers/1`, {
      headers: authHeader,
      body: {
        answer: 'Blurp'
      }
    })
      .expect('status', 401)
  })

  it('DELETE existing security answer is forbidden via public API even when authenticated', () => {
    return frisby.del(`${API_URL}/SecurityAnswers/1`, { headers: authHeader })
      .expect('status', 401)
  })
})
