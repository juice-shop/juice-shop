/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'
import * as security from '../../lib/insecurity'
import { login } from './helpers/auth'
import { SecurityAnswerModel } from '../../models/securityAnswer'
import { UserModel } from '../../models/user'

let app: Express
const jsonHeader = { 'content-type': 'application/json' }
const authHeader = { Authorization: `Bearer ${security.authorize()}`, 'content-type': 'application/json' }

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/api/SecurityAnswers', () => {
  void it('GET all security answers is forbidden via public API even when authenticated', async () => {
    const res = await request(app)
      .get('/api/SecurityAnswers')
      .set(authHeader)

    assert.equal(res.status, 401)
  })

  void it('POST new security answer is forbidden via public API', async () => {
    const answersBefore = await SecurityAnswerModel.count()
    const res = await request(app)
      .post('/api/SecurityAnswers')
      .set(jsonHeader)
      .send({
        UserId: 1,
        SecurityQuestionId: 1,
        answer: 'Horst'
      })

    assert.equal(res.status, 401)
    assert.equal(await SecurityAnswerModel.count(), answersBefore)
  })

  void it('POST new security answer is forbidden via public API even when authenticated', async () => {
    const answersBefore = await SecurityAnswerModel.count()
    const res = await request(app)
      .post('/api/SecurityAnswers')
      .set(authHeader)
      .send({
        UserId: 1,
        SecurityQuestionId: 1,
        answer: 'Horst'
      })

    assert.equal(res.status, 401)
    assert.equal(await SecurityAnswerModel.count(), answersBefore)
  })

  void it('POST new security answer is forbidden via public API even when logged in as a real user', async () => {
    const { token } = await login(app, { email: 'jim@juice-sh.op', password: 'ncc-1701' })
    const answersBefore = await SecurityAnswerModel.count()
    const res = await request(app)
      .post('/api/SecurityAnswers/')
      .set({ ...jsonHeader, Authorization: `Bearer ${token}` })
      .send({
        SecurityQuestionId: 1,
        answer: 'Horst'
      })

    assert.equal(res.status, 401)
    assert.equal(await SecurityAnswerModel.count(), answersBefore)
  })

  void it('POST does not add a security answer to an existing user without one', async () => {
    const user = await UserModel.findOne({ where: { email: 'testing@juice-sh.op' } })
    assert.ok(user)
    assert.equal(await SecurityAnswerModel.count({ where: { UserId: user.id } }), 0)

    const anonymousRes = await request(app)
      .post('/api/SecurityAnswers')
      .set(jsonHeader)
      .send({ UserId: user.id, SecurityQuestionId: 1, answer: 'Horst' })
    const authenticatedRes = await request(app)
      .post('/api/SecurityAnswers')
      .set(authHeader)
      .send({ UserId: user.id, SecurityQuestionId: 1, answer: 'Horst' })

    assert.equal(anonymousRes.status, 401)
    assert.equal(authenticatedRes.status, 401)
    assert.equal(await SecurityAnswerModel.count({ where: { UserId: user.id } }), 0)
  })
})

void describe('/api/SecurityAnswers/:id', () => {
  void it('GET existing security answer by id is forbidden via public API even when authenticated', async () => {
    const res = await request(app)
      .get('/api/SecurityAnswers/1')
      .set(authHeader)

    assert.equal(res.status, 401)
  })

  void it('POST security answer for a newly registered user is forbidden via public API', async () => {
    const userRes = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'new.user@te.st',
        password: '12345'
      })

    assert.equal(userRes.status, 201)

    const res = await request(app)
      .post('/api/SecurityAnswers')
      .set(authHeader)
      .send({
        UserId: userRes.body.data.id,
        SecurityQuestionId: 1,
        answer: 'Horst'
      })

    assert.equal(res.status, 401)
    assert.equal(await SecurityAnswerModel.count({ where: { UserId: userRes.body.data.id } }), 0)
  })

  void it('PUT update existing security answer is forbidden via public API even when authenticated', async () => {
    const res = await request(app)
      .put('/api/SecurityAnswers/1')
      .set(authHeader)
      .send({
        answer: 'Blurp'
      })

    assert.equal(res.status, 401)
  })

  void it('DELETE existing security answer is forbidden via public API even when authenticated', async () => {
    const res = await request(app)
      .delete('/api/SecurityAnswers/1')
      .set(authHeader)

    assert.equal(res.status, 401)
  })
})
