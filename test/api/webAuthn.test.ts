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
import { buildAssertion, buildAttestation, loadVictimCredential } from './helpers/webauthn'
import { AuthenticatorModel } from '../../models/authenticator'
import { challenges } from '../../data/datacache'
import * as security from '../../lib/insecurity'

const jsonHeader = { 'content-type': 'application/json' }
const VICTIM_EMAIL = 'passkey-user@juice-sh.op'

let app: Express
const victim = loadVictimCredential()

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/rest/webauthn/login-options', () => {
  void it('POST leaks the matching credential IDs when an email is supplied', async () => {
    const res = await request(app)
      .post('/rest/webauthn/login-options')
      .set(jsonHeader)
      .send({ email: VICTIM_EMAIL })

    assert.equal(res.status, 200)
    assert.equal(typeof res.body.authToken, 'string')
    assert.equal(typeof res.body.options.challenge, 'string')
    const ids = res.body.options.allowCredentials.map((c: { id: string }) => c.id)
    assert.ok(ids.includes(victim.credentialID))
  })

  void it('POST omits allowCredentials in discoverable mode (no email)', async () => {
    const res = await request(app)
      .post('/rest/webauthn/login-options')
      .set(jsonHeader)
      .send({})

    assert.equal(res.status, 200)
    assert.equal(res.body.options.allowCredentials, undefined)
  })
})

void describe('/rest/webauthn/login-verify', () => {
  async function loginOptions () {
    const res = await request(app)
      .post('/rest/webauthn/login-options')
      .set(jsonHeader)
      .send({ email: VICTIM_EMAIL })
    return { challenge: res.body.options.challenge as string, authToken: res.body.authToken as string }
  }

  void it('POST signs the user in for a genuine assertion without solving the challenge', async () => {
    challenges.webauthnSignatureChallenge.solved = false
    const { challenge, authToken } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: false })

    const res = await request(app)
      .post('/rest/webauthn/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken })

    assert.equal(res.status, 200)
    assert.equal(typeof res.body.authentication.token, 'string')
    assert.equal(res.body.authentication.umail, VICTIM_EMAIL)
    assert.equal(challenges.webauthnSignatureChallenge.solved, false)
  })

  void it('POST accepts a forged signature and solves webauthnSignatureChallenge', async () => {
    challenges.webauthnSignatureChallenge.solved = false
    const { challenge, authToken } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: true, counter: 2 })

    const res = await request(app)
      .post('/rest/webauthn/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken })

    assert.equal(res.status, 200)
    assert.equal(typeof res.body.authentication.token, 'string')
    assert.equal(res.body.authentication.umail, VICTIM_EMAIL)
    assert.equal(challenges.webauthnSignatureChallenge.solved, true)
  })

  void it('POST returns 401 for a missing authToken', async () => {
    const { challenge } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: false })

    const res = await request(app)
      .post('/rest/webauthn/login-verify')
      .set(jsonHeader)
      .send({ assertion })

    assert.equal(res.status, 401)
  })

  void it('POST returns 401 for an authToken of the wrong type', async () => {
    const { challenge } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: false })
    const authToken = security.authorize({ challenge, type: 'not_webauthn_auth' })

    const res = await request(app)
      .post('/rest/webauthn/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken })

    assert.equal(res.status, 401)
  })

  void it('POST returns 401 for an unknown credential ID', async () => {
    const { challenge, authToken } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: false })
    assertion.id = 'this-credential-does-not-exist'

    const res = await request(app)
      .post('/rest/webauthn/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken })

    assert.equal(res.status, 401)
  })
})

void describe('/rest/webauthn/register-verify', () => {
  async function attackerContext () {
    const { token } = await login(app, { email: 'jim@juice-sh.op', password: 'ncc-1701' })
    const optionsRes = await request(app)
      .get('/rest/webauthn/register-options')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })
    return { token, challenge: optionsRes.body.options.challenge as string, regToken: optionsRes.body.regToken as string }
  }

  void it('POST overwrites the victim credential and solves webauthnCredentialOverwriteChallenge', async () => {
    challenges.webauthnCredentialOverwriteChallenge.solved = false
    const { token, challenge, regToken } = await attackerContext()
    const { attestation, publicKey } = buildAttestation(victim.credentialID, challenge)

    const res = await request(app)
      .post('/rest/webauthn/register-verify')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })
      .send({ attestation, regToken })

    assert.equal(res.status, 200)
    assert.equal(res.body.verified, true)

    const row = await AuthenticatorModel.findOne({ where: { credentialID: victim.credentialID } })
    assert.ok(row)
    assert.equal(row.publicKey, publicKey)
    assert.equal(challenges.webauthnCredentialOverwriteChallenge.solved, true)
  })

  void it('POST returns 401 when unauthenticated', async () => {
    const { challenge } = await attackerContext()
    const { attestation } = buildAttestation(victim.credentialID, challenge)
    const regToken = security.authorize({ userId: 0, challenge, type: 'webauthn_reg' })

    const res = await request(app)
      .post('/rest/webauthn/register-verify')
      .set(jsonHeader)
      .send({ attestation, regToken })

    assert.equal(res.status, 401)
  })

  void it('POST returns 401 for a regToken of the wrong type', async () => {
    const { token, challenge } = await attackerContext()
    const { attestation } = buildAttestation(victim.credentialID, challenge)
    const regToken = security.authorize({ challenge, type: 'not_webauthn_reg' })

    const res = await request(app)
      .post('/rest/webauthn/register-verify')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })
      .send({ attestation, regToken })

    assert.equal(res.status, 401)
  })
})

void describe('/rest/webauthn/credentials', () => {
  void it('GET returns 401 when not logged in', async () => {
    const res = await request(app).get('/rest/webauthn/credentials')
    assert.equal(res.status, 401)
  })

  void it('GET lists the logged-in user\'s passkeys', async () => {
    const { token } = await login(app, { email: VICTIM_EMAIL, password: 'ei9shi3Aezohnuku' })

    const res = await request(app)
      .get('/rest/webauthn/credentials')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })

    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.body.data))
    assert.ok(res.body.data.some((c: { credentialID: string }) => c.credentialID === victim.credentialID))
  })
})
