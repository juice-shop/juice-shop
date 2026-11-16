/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'
import { login } from './helpers/auth'
import { challenges } from '../../data/datacache'
import * as security from '../../lib/insecurity'
import * as utils from '../../lib/utils'
import logger from '../../lib/logger'
import { SecurityAnswerModel } from '../../models/securityAnswer'
import { UserModel } from '../../models/user'

let app: Express
let authHeader: Record<string, string>

before(async () => {
  const result = await createTestApp()
  app = result.app
  authHeader = { Authorization: `Bearer ${security.authorize()}`, 'content-type': 'application/json' }
}, { timeout: 60000 })

const jsonHeader = { 'content-type': 'application/json' }

void describe('/api/Users', () => {
  void it('GET all users is forbidden via public API', async () => {
    const res = await request(app).get('/api/Users')
    assert.equal(res.status, 401)
  })

  void it('GET all users', async () => {
    const res = await request(app).get('/api/Users').set(authHeader)
    assert.equal(res.status, 200)
  })

  void it('GET all users doesnt include passwords', async () => {
    const res = await request(app).get('/api/Users').set(authHeader)
    assert.equal(res.status, 200)
    for (const user of res.body.data) {
      assert.equal(user.password, undefined)
    }
  })

  void it('POST new user', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'horst@horstma.nn',
        password: 'hooooorst'
      })
    assert.equal(res.status, 201)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.data.id, 'number')
    assert.equal(typeof res.body.data.createdAt, 'string')
    assert.equal(typeof res.body.data.updatedAt, 'string')
    assert.equal(res.body.data.password, undefined)
  })

  void it('POST new admin', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'horst2@horstma.nn',
        password: 'hooooorst',
        role: 'admin'
      })
    assert.equal(res.status, 201)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.data.id, 'number')
    assert.equal(typeof res.body.data.createdAt, 'string')
    assert.equal(typeof res.body.data.updatedAt, 'string')
    assert.equal(res.body.data.password, undefined)
    assert.equal(res.body.data.role, 'admin')
  })

  void it('POST new blank user', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: ' ',
        password: ' '
      })
    assert.equal(res.status, 201)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.data.id, 'number')
    assert.equal(typeof res.body.data.createdAt, 'string')
    assert.equal(typeof res.body.data.updatedAt, 'string')
    assert.equal(res.body.data.password, undefined)
  })

  void it('POST same blank user in database', async () => {
    await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'blank-duplicate@test.test',
        password: ' '
      })
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'blank-duplicate@test.test',
        password: ' '
      })
    assert.equal(res.status, 400)
    assert.ok(res.headers['content-type']?.includes('application/json'))
  })

  void it('POST whitespaces user', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: ' test@gmail.com',
        password: ' test'
      })
    assert.equal(res.status, 201)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.data.id, 'number')
    assert.equal(typeof res.body.data.updatedAt, 'string')
    assert.equal(res.body.data.password, undefined)
  })

  void it('POST new deluxe user', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'horst3@horstma.nn',
        password: 'hooooorst',
        role: 'deluxe'
      })
    assert.equal(res.status, 201)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.data.id, 'number')
    assert.equal(typeof res.body.data.createdAt, 'string')
    assert.equal(typeof res.body.data.updatedAt, 'string')
    assert.equal(res.body.data.password, undefined)
    assert.equal(res.body.data.role, 'deluxe')
  })

  void it('POST new accounting user', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'horst4@horstma.nn',
        password: 'hooooorst',
        role: 'accounting'
      })
    assert.equal(res.status, 201)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.data.id, 'number')
    assert.equal(typeof res.body.data.createdAt, 'string')
    assert.equal(typeof res.body.data.updatedAt, 'string')
    assert.equal(res.body.data.password, undefined)
    assert.equal(res.body.data.role, 'accounting')
  })

  void it('POST user not belonging to customer, deluxe, accounting, admin is forbidden', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'horst5@horstma.nn',
        password: 'hooooorst',
        role: 'accountinguser'
      })
    assert.equal(res.status, 400)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(res.body.message, 'Validation error: Validation isIn on role failed')
    assert.equal(res.body.errors[0].field, 'role')
    assert.equal(res.body.errors[0].message, 'Validation isIn on role failed')
  })

  if (utils.isChallengeEnabled(challenges.persistedXssUserChallenge)) {
    void it('POST new user with XSS attack in email address', async () => {
      const res = await request(app)
        .post('/api/Users')
        .set(jsonHeader)
        .send({
          email: '<iframe src="javascript:alert(`xss`)">',
          password: 'does.not.matter'
        })
      assert.equal(res.status, 201)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.data.email, '<iframe src="javascript:alert(`xss`)">')
    })
  }
})

void describe('/api/Users with security question and answer', () => {
  const registration = (email: string, extra: Record<string, unknown> = {}) => ({
    email,
    password: 'hooooorst',
    passwordRepeat: 'hooooorst',
    securityQuestion: { id: 1, question: 'Your eldest siblings middle name?' },
    securityAnswer: 'Horst',
    ...extra
  })

  const usersWithEmail = async (email: string) => await UserModel.count({ where: { email }, paranoid: false })

  void it('POST new user with security question and answer creates exactly one user and one security answer for it', async () => {
    const email = 'sa-create@horstma.nn'
    const answersBefore = await SecurityAnswerModel.count()
    const res = await request(app)
      .post('/api/Users/')
      .set(jsonHeader)
      .send(registration(email))
    assert.equal(res.status, 201)
    assert.equal(await usersWithEmail(email), 1)
    const answers = await SecurityAnswerModel.findAll({ where: { UserId: res.body.data.id } })
    assert.equal(answers.length, 1)
    assert.equal(answers[0].SecurityQuestionId, 1)
    assert.equal(answers[0].answer, security.hmac('Horst'))
    assert.equal(await SecurityAnswerModel.count(), answersBefore + 1)
  })

  void it('POST new user without security question and answer still succeeds and creates no security answer', async () => {
    const answersBefore = await SecurityAnswerModel.count()
    const withoutRes = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({ email: 'sa-none@horstma.nn', password: 'hooooorst', passwordRepeat: 'hooooorst' })
    const withNullsRes = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({ email: 'sa-null@horstma.nn', password: 'hooooorst', passwordRepeat: 'hooooorst', securityQuestion: null, securityAnswer: null })
    assert.equal(withoutRes.status, 201)
    assert.equal(withNullsRes.status, 201)
    assert.equal(await SecurityAnswerModel.count({ where: { UserId: withoutRes.body.data.id } }), 0)
    assert.equal(await SecurityAnswerModel.count({ where: { UserId: withNullsRes.body.data.id } }), 0)
    assert.equal(await SecurityAnswerModel.count(), answersBefore)
  })

  void it('POST new user with security answer of exactly the maximum length succeeds', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send(registration('sa-maxlength@horstma.nn', { securityAnswer: 'a'.repeat(255) }))
    assert.equal(res.status, 201)
    assert.equal(await SecurityAnswerModel.count({ where: { UserId: res.body.data.id } }), 1)
  })

  const invalidRegistrations: Array<[string, Record<string, unknown>, string]> = [
    ['non-existing security question id', { securityQuestion: { id: 9999 } }, 'securityQuestion'],
    ['non-numeric security question id', { securityQuestion: { id: '1' } }, 'securityQuestion'],
    ['security question without id', { securityQuestion: {} }, 'securityQuestion'],
    ['missing security question', { securityQuestion: undefined }, 'securityQuestion'],
    ['empty security answer', { securityAnswer: '' }, 'securityAnswer'],
    ['whitespace-only security answer', { securityAnswer: '   ' }, 'securityAnswer'],
    ['non-string security answer', { securityAnswer: 42 }, 'securityAnswer'],
    ['missing security answer', { securityAnswer: undefined }, 'securityAnswer'],
    ['too long security answer', { securityAnswer: 'a'.repeat(256) }, 'securityAnswer']
  ]
  for (const [description, extra, field] of invalidRegistrations) {
    void it(`POST new user with ${description} is rejected and leaves neither user nor security answer`, async () => {
      const email = `sa-invalid-${field}-${invalidRegistrations.findIndex(([d]) => d === description)}@horstma.nn`
      const answersBefore = await SecurityAnswerModel.count()
      const res = await request(app)
        .post('/api/Users')
        .set(jsonHeader)
        .send(registration(email, extra))
      assert.equal(res.status, 400)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.message, 'Validation error')
      assert.equal(res.body.errors[0].field, field)
      assert.equal(await usersWithEmail(email), 0)
      assert.equal(await SecurityAnswerModel.count(), answersBefore)
    })
  }

  void it('POST new user removes the created user again when the security answer cannot be created', async (t) => {
    const email = 'sa-compensation@horstma.nn'
    const answersBefore = await SecurityAnswerModel.count()
    t.mock.method(SecurityAnswerModel, 'create', async () => { throw new Error('simulated security answer failure') })
    const loggedErrors = t.mock.method(logger, 'error', () => logger)
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send(registration(email))
    t.mock.restoreAll()
    assert.equal(res.status, 500)
    assert.equal(res.body.message, 'User registration could not be completed')
    assert.ok(!JSON.stringify(res.body).includes('simulated'))
    assert.equal(await usersWithEmail(email), 0)
    assert.equal(await SecurityAnswerModel.count(), answersBefore)
    assert.ok(loggedErrors.mock.calls.some(call => String(call.arguments[0]).includes('simulated security answer failure')))
  })

  void it('POST new user logs both errors and responds safely when removing the user after a failed security answer also fails', async (t) => {
    const email = 'sa-compensation-failure@horstma.nn'
    t.mock.method(SecurityAnswerModel, 'create', async () => { throw new Error('simulated security answer failure') })
    t.mock.method(UserModel, 'destroy', async () => { throw new Error('simulated user removal failure') })
    const loggedErrors = t.mock.method(logger, 'error', () => logger)
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send(registration(email))
    t.mock.restoreAll()
    assert.equal(res.status, 500)
    assert.equal(res.body.message, 'User registration could not be completed')
    assert.ok(!JSON.stringify(res.body).includes('simulated'))
    const messages = loggedErrors.mock.calls.map(call => String(call.arguments[0]))
    assert.ok(messages.some(message => message.includes('simulated security answer failure')))
    assert.ok(messages.some(message => message.includes('simulated user removal failure')))
  })

  void it('POST new user ignores a client-supplied UserId for the security answer', async () => {
    const email = 'sa-userid@horstma.nn'
    const adminAnswerBefore = await SecurityAnswerModel.findOne({ where: { UserId: 1 } })
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send(registration(email, { UserId: 1, securityAnswer: 'NotTheAdminsAnswer' }))
    assert.equal(res.status, 201)
    assert.notEqual(res.body.data.id, 1)
    const answer = await SecurityAnswerModel.findOne({ where: { UserId: res.body.data.id } })
    assert.equal(answer?.answer, security.hmac('NotTheAdminsAnswer'))
    const adminAnswerAfter = await SecurityAnswerModel.findOne({ where: { UserId: 1 } })
    assert.equal(adminAnswerAfter?.answer, adminAnswerBefore?.answer)
    assert.equal(await SecurityAnswerModel.count({ where: { UserId: 1 } }), 1)
  })

  void it('POST new user while logged in as another user binds the security answer to the new user', async () => {
    const { token } = await login(app, { email: 'jim@juice-sh.op', password: 'ncc-1701' })
    const jim = await UserModel.findOne({ where: { email: 'jim@juice-sh.op' } })
    const jimsAnswerBefore = await SecurityAnswerModel.findOne({ where: { UserId: jim?.id } })
    const res = await request(app)
      .post('/api/Users')
      .set({ ...jsonHeader, Authorization: `Bearer ${token}` })
      .send(registration('sa-loggedin@horstma.nn'))
    assert.equal(res.status, 201)
    assert.notEqual(res.body.data.id, jim?.id)
    assert.equal(await SecurityAnswerModel.count({ where: { UserId: res.body.data.id } }), 1)
    const jimsAnswerAfter = await SecurityAnswerModel.findOne({ where: { UserId: jim?.id } })
    assert.equal(jimsAnswerAfter?.answer, jimsAnswerBefore?.answer)
  })

  void it('POST password reset succeeds with the security answer given during registration', async () => {
    const email = 'sa-reset@horstma.nn'
    const registerRes = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send(registration(email, { securityAnswer: 'My registration answer' }))
    assert.equal(registerRes.status, 201)

    const wrongRes = await request(app)
      .post('/rest/user/reset-password')
      .set(jsonHeader)
      .send({ email, answer: 'Wrong answer', new: 'newPassw0rd', repeat: 'newPassw0rd' })
    assert.equal(wrongRes.status, 401)

    const resetRes = await request(app)
      .post('/rest/user/reset-password')
      .set(jsonHeader)
      .send({ email, answer: 'My registration answer', new: 'newPassw0rd', repeat: 'newPassw0rd' })
    assert.equal(resetRes.status, 200)

    const { token } = await login(app, { email, password: 'newPassw0rd' })
    assert.equal(typeof token, 'string')
  })

  void it('POST concurrent registrations with the same email create only one user and one security answer', async () => {
    const email = 'sa-concurrent@horstma.nn'
    const answersBefore = await SecurityAnswerModel.count()
    const results = await Promise.all(Array.from({ length: 5 }, async (_, i) => await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send(registration(email, { securityAnswer: `Answer ${i}` }))))
    const created = results.filter(res => res.status === 201)
    assert.equal(created.length, 1)
    assert.ok(results.filter(res => res.status !== 201).every(res => res.status === 400))
    assert.equal(await usersWithEmail(email), 1)
    assert.equal(await SecurityAnswerModel.count({ where: { UserId: created[0].body.data.id } }), 1)
    assert.equal(await SecurityAnswerModel.count(), answersBefore + 1)
  })
})

void describe('/api/Users/:id', () => {
  void it('GET existing user by id is forbidden via public API', async () => {
    const res = await request(app).get('/api/Users/1')
    assert.equal(res.status, 401)
  })

  void it('PUT update existing user is forbidden via public API', async () => {
    const res = await request(app)
      .put('/api/Users/1')
      .set(jsonHeader)
      .send({ email: 'administr@t.or' })
    assert.equal(res.status, 401)
  })

  void it('DELETE existing user is forbidden via public API', async () => {
    const res = await request(app).delete('/api/Users/1')
    assert.equal(res.status, 401)
  })

  void it('GET existing user by id', async () => {
    const res = await request(app).get('/api/Users/1').set(authHeader)
    assert.equal(res.status, 200)
  })

  void it('PUT update existing user is forbidden via API even when authenticated', async () => {
    const res = await request(app)
      .put('/api/Users/1')
      .set(authHeader)
      .send({ email: 'horst.horstmann@horstma.nn' })
    assert.equal(res.status, 401)
  })

  void it('DELETE existing user is forbidden via API even when authenticated', async () => {
    const res = await request(app).delete('/api/Users/1').set(authHeader)
    assert.equal(res.status, 401)
  })
})

void describe('/rest/user/whoami', () => {
  void it('GET own user id and email on who-am-i request', async () => {
    const { token } = await login(app, {
      email: 'bjoern.kimminich@gmail.com',
      password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
    })
    const res = await request(app)
      .get('/rest/user/whoami')
      .set({ Cookie: `token=${token}` })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.user.id, 'number')
    assert.equal(typeof res.body.user.email, 'string')
    assert.equal(res.body.user.email, 'bjoern.kimminich@gmail.com')
  })

  void it('GET who-am-i request returns nothing on missing auth token', async () => {
    const res = await request(app).get('/rest/user/whoami')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.deepEqual(res.body.user, {})
  })

  void it('GET who-am-i request returns nothing on invalid auth token', async () => {
    const res = await request(app)
      .get('/rest/user/whoami')
      .set({ Authorization: 'Bearer InvalidAuthToken' })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.deepEqual(res.body.user, {})
  })

  void it('GET who-am-i request returns nothing on broken auth token', async () => {
    const res = await request(app)
      .get('/rest/user/whoami')
      .set({ Authorization: 'BoarBeatsBear' })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.deepEqual(res.body.user, {})
  })

  void it('GET who-am-i request returns nothing on expired auth token', async () => {
    const res = await request(app)
      .get('/rest/user/whoami')
      .set({ Authorization: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGF0dXMiOiJzdWNjZXNzIiwiZGF0YSI6eyJpZCI6MSwidXNlcm5hbWUiOiIiLCJlbWFpbCI6ImFkbWluQGp1aWNlLXNoLm9wIiwicGFzc3dvcmQiOiIwMTkyMDIzYTdiYmQ3MzI1MDUxNmYwNjlkZjE4YjUwMCIsInJvbGUiOiJhZG1pbiIsImxhc3RMb2dpbklwIjoiMC4wLjAuMCIsInByb2ZpbGVJbWFnZSI6ImRlZmF1bHQuc3ZnIiwidG90cFNlY3JldCI6IiIsImlzQWN0aXZlIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDE5LTA4LTE5IDE1OjU2OjE1LjYyOSArMDA6MDAiLCJ1cGRhdGVkQXQiOiIyMDE5LTA4LTE5IDE1OjU2OjE1LjYyOSArMDA6MDAiLCJkZWxldGVkQXQiOm51bGx9LCJpYXQiOjE1NjYyMzAyMjQsImV4cCI6MTU2NjI0ODIyNH0.FL0kkcInY5sDMGKeLHfEOYDTQd3BjR6_mK7Tcm_RH6iCLotTSRRoRxHpLkbtIQKqBFIt14J4BpLapkzG7ppRWcEley5nego-4iFOmXQvCBz5ISS3HdtM0saJnOe0agyVUen3huFp4F2UCth_y2ScjMn_4AgW66cz8NSFPRVpC8g' })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.deepEqual(res.body.user, {})
  })

  void it('GET who-am-i with fields parameter returns only requested fields', async () => {
    const { token } = await login(app, {
      email: 'bjoern.kimminich@gmail.com',
      password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
    })
    const res = await request(app)
      .get('/rest/user/whoami?fields=id,email')
      .set({ Cookie: `token=${token}` })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.user.id, 'number')
    assert.equal(typeof res.body.user.email, 'string')
    assert.equal(res.body.user.email, 'bjoern.kimminich@gmail.com')
  })

  void it('GET who-am-i with fields parameter does not return password by default', async () => {
    const { token } = await login(app, {
      email: 'bjoern.kimminich@gmail.com',
      password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
    })
    const res = await request(app)
      .get('/rest/user/whoami?fields=id,email')
      .set({ Cookie: `token=${token}` })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.user.id, 'number')
    assert.equal(typeof res.body.user.email, 'string')
  })

  void it('GET who-am-i with fields parameter can be tricked into returning password', async () => {
    const { token } = await login(app, {
      email: 'bjoern.kimminich@gmail.com',
      password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
    })
    const res = await request(app)
      .get('/rest/user/whoami?fields=id,email,password')
      .set({ Cookie: `token=${token}` })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.user.id, 'number')
    assert.equal(typeof res.body.user.email, 'string')
    assert.equal(typeof res.body.user.password, 'string')
  })
})
