/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { retrieveLoggedInUser } from '../../routes/currentUser'
import { authenticatedUsers } from '../../lib/insecurity'
import * as security from '../../lib/insecurity'
import { challenges } from '../../data/datacache'
import type { Challenge } from '@juice-shop/data/types'
import type { UserModel } from '@juice-shop/models/user'

void describe('currentUser', () => {
  let req: any
  let res: any
  let save: any

  beforeEach(() => {
    req = { cookies: {}, query: {} }
    res = { json: mock.fn(), jsonp: mock.fn() }
    save = () => ({
      then () { }
    })
    challenges.passwordHashLeakChallenge = { solved: false, save } as unknown as Challenge
    challenges.emailLeakChallenge = { solved: false, save } as unknown as Challenge
  })

  void it('should return neither ID nor email if no cookie was present in the request headers', () => {
    req.cookies.token = ''

    retrieveLoggedInUser()(req, res)

    assert.equal(res.json.mock.calls.length, 1)
    assert.deepEqual(res.json.mock.calls[0].arguments[0], { user: { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined } })
  })

  void it('should return ID and email of user belonging to cookie from the request', () => {
    req.cookies.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJkYXRhIjp7ImlkIjoxLCJlbWFpbCI6ImFkbWluQGp1aWNlLXNoLm9wIiwibGFzdExvZ2luSXAiOiIwLjAuMC4wIiwicHJvZmlsZUltYWdlIjoiZGVmYXVsdC5zdmcifSwiaWF0IjoxNTgyMjIyMzY0fQ.CHiFQieZudYlrd1o8Ih-Izv7XY_WZupt8Our-CP9HqsczyEKqrWC7wWguOgVuSGDN_S3mP4FyuEFN8l60aAhVsUbqzFetvJkFwe5nKVhc9dHuen6cujQLMcTlHLKassOSDP41Q-MkKWcUOQu0xUkTMfEq2hPMHpMosDb4benzH0'
    req.query.callback = undefined
    authenticatedUsers.put(
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJkYXRhIjp7ImlkIjoxLCJlbWFpbCI6ImFkbWluQGp1aWNlLXNoLm9wIiwibGFzdExvZ2luSXAiOiIwLjAuMC4wIiwicHJvZmlsZUltYWdlIjoiZGVmYXVsdC5zdmcifSwiaWF0IjoxNTgyMjIyMzY0fQ.CHiFQieZudYlrd1o8Ih-Izv7XY_WZupt8Our-CP9HqsczyEKqrWC7wWguOgVuSGDN_S3mP4FyuEFN8l60aAhVsUbqzFetvJkFwe5nKVhc9dHuen6cujQLMcTlHLKassOSDP41Q-MkKWcUOQu0xUkTMfEq2hPMHpMosDb4benzH0',
      { data: { id: 1, email: 'admin@juice-sh.op', lastLoginIp: '0.0.0.0', profileImage: '/assets/public/images/uploads/default.svg' } as unknown as UserModel }
    )
    retrieveLoggedInUser()(req, res)

    assert.equal(res.json.mock.calls.length, 1)
    assert.deepEqual(res.json.mock.calls[0].arguments[0], { user: { id: 1, email: 'admin@juice-sh.op', lastLoginIp: '0.0.0.0', profileImage: '/assets/public/images/uploads/default.svg' } })
  })

  void it('should filter specific requested fields and solve passwordHashLeakChallenge if password is leaked', () => {
    const token = security.authorize({ data: { id: 2, email: 'user@juice-sh.op', password: 'hashedpassword' } })
    req.cookies.token = token
    req.query.fields = 'email, password'
    authenticatedUsers.put(token, {
      data: { id: 2, email: 'user@juice-sh.op', password: 'hashedpassword' } as unknown as UserModel
    })

    retrieveLoggedInUser()(req, res)

    assert.equal(res.json.mock.calls.length, 1)
    assert.deepEqual(res.json.mock.calls[0].arguments[0], { user: { email: 'user@juice-sh.op', password: 'hashedpassword' } })
    assert.equal(challenges.passwordHashLeakChallenge.solved, true)
  })

  void it('should respond with jsonp and solve emailLeakChallenge when callback query param is present', () => {
    const token = security.authorize({ data: { id: 3, email: 'leak@juice-sh.op' } })
    req.cookies.token = token
    req.query.callback = 'angular.callbacks._0'
    authenticatedUsers.put(token, {
      data: { id: 3, email: 'leak@juice-sh.op' } as unknown as UserModel
    })

    retrieveLoggedInUser()(req, res)

    assert.equal(res.jsonp.mock.calls.length, 1)
    assert.equal(challenges.emailLeakChallenge.solved, true)
  })

  void it('should return empty user on exception in try block', () => {
    const brokenReq: any = {
      get cookies () {
        throw new Error('Broken cookies')
      },
      query: {}
    }

    retrieveLoggedInUser()(brokenReq, res)

    assert.equal(res.json.mock.calls.length, 1)
    assert.deepEqual(res.json.mock.calls[0].arguments[0], { user: { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined } })
  })
})
