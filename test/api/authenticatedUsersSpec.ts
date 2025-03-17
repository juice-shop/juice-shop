/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as frisby from 'frisby'
import * as security from '../../lib/insecurity'
import { expect } from '@jest/globals'
import config from 'config'

const REST_URL = 'http://localhost:3000/rest'

const jsonHeader = { ContentType: 'application/json' }
const authHeader = { Authorization: `Bearer ${security.authorize({ data: { email: 'admin@juice-sh.op' } })}`, 'content-type': 'application/json' }

describe('/rest/user/authentication-details', () => {
  it('GET all users with password replaced by asterisks', () => {
    return frisby.get(`${REST_URL}/user/authentication-details`, { headers: authHeader })
      .expect('status', 200)
      .expect('json', 'data.?', {
        password: '********************************'
      })
  })

  it('GET returns lastLoginTime for users with active sessions', async () => {
    await frisby.post(`${REST_URL}/user/login`, {
      headers: jsonHeader,
      body: {
        email: `jim@${config.get<string>('application.domain')}`,
        password: 'ncc-1701'
      }
    }).promise()

    const response = await frisby.get(`${REST_URL}/user/authentication-details`, { headers: authHeader })
      .expect('status', 200)
      .promise()

    const jim = response.json.data.find((user: any) => user.email.startsWith('jim@'))

    expect(jim).not.toBe(null)
    expect(jim.lastLoginTime).toEqual(expect.any(Number))
  })
})
