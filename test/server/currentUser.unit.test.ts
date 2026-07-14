/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { retrieveLoggedInUser } from '../../routes/currentUser'
import { authenticatedUsers } from '../../lib/insecurity'
import type { UserModel } from '@juice-shop/models/user'

void describe('currentUser', () => {
  let req: any
  let res: any

  beforeEach(() => {
    req = { cookies: {}, query: {} }
    res = { json: mock.fn() }
  })

  void it('should return neither ID nor email if no cookie was present in the request headers', () => {
    req.cookies.token = ''

    retrieveLoggedInUser()(req, res)

    assert.equal(res.json.mock.calls.length, 1)
    assert.deepEqual(res.json.mock.calls[0].arguments[0], { user: { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined } })
  })

  void it('should return ID and email of user belonging to cookie from the request', () => {
    req.cookies.token = 'REVOKED_JWT_TOKEN';
    req.query.callback = undefined
authenticatedUsers.put(
       'REVOKED_JWT_TOKEN',
      { data: { id: 1, email: 'admin@juice-sh.op', lastLoginIp: '0.0.0.0', profileImage: '/assets/public/images/uploads/default.svg' } as unknown as UserModel }
    )
    retrieveLoggedInUser()(req, res)

    assert.equal(res.json.mock.calls.length, 1)
    assert.deepEqual(res.json.mock.calls[0].arguments[0], { user: { id: 1, email: 'admin@juice-sh.op', lastLoginIp: '0.0.0.0', profileImage: '/assets/public/images/uploads/default.svg' } })
  })
})
