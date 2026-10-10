/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import crypto from 'node:crypto'
import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'
import { login } from './helpers/auth'
import { isoBase64URL } from '@simplewebauthn/server/helpers'
import { buildAssertion, buildAttestation, flipBit, loadVictimCredential } from './helpers/passkey'
import { PasskeyModel } from '../../models/passkey'
import { challenges } from '../../data/datacache'
import * as security from '../../lib/insecurity'

// The relying party is derived from the request, so pin the Host the crafted payloads are bound to.
const jsonHeader = { 'content-type': 'application/json', host: 'localhost:3000' }
const VICTIM_EMAIL = 'passkey-user@juice-sh.op'

let app: Express
const victim = loadVictimCredential()

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/rest/passkey/login-options', () => {
  void it('POST leaks the matching credential IDs when an email is supplied', async () => {
    const res = await request(app)
      .post('/rest/passkey/login-options')
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
      .post('/rest/passkey/login-options')
      .set(jsonHeader)
      .send({})

    assert.equal(res.status, 200)
    assert.equal(res.body.options.allowCredentials, undefined)
  })

  void it('POST ignores an email that is not a string', async () => {
    for (const email of [[VICTIM_EMAIL, 'jim@juice-sh.op'], { foo: 1 }]) {
      const res = await request(app)
        .post('/rest/passkey/login-options')
        .set(jsonHeader)
        .send({ email })

      assert.equal(res.status, 200)
      assert.equal(res.body.options.allowCredentials, undefined)
    }
  })

  void it('POST returns an authToken that is not accepted as a session token', async () => {
    const { body: { authToken } } = await request(app)
      .post('/rest/passkey/login-options')
      .set(jsonHeader)
      .send({})

    const res = await request(app)
      .get('/api/Users')
      .set({ Authorization: 'Bearer ' + authToken })

    assert.equal(res.status, 401)
  })
})

void describe('/rest/passkey/login-verify', () => {
  async function loginOptions (headers: Record<string, string> = jsonHeader) {
    const res = await request(app)
      .post('/rest/passkey/login-options')
      .set(headers)
      .send({ email: VICTIM_EMAIL })
    return { challenge: res.body.options.challenge as string, authToken: res.body.authToken as string }
  }

  void it('POST signs the user in for a genuine assertion without solving any challenge', async () => {
    challenges.passkeySignatureChallenge.solved = false
    challenges.passkeyCredentialOverwriteChallenge.solved = false
    const { challenge, authToken } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: false })

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken })

    assert.equal(res.status, 200)
    assert.equal(typeof res.body.authentication.token, 'string')
    assert.equal(res.body.authentication.umail, VICTIM_EMAIL)
    assert.equal(challenges.passkeySignatureChallenge.solved, false)
    assert.equal(challenges.passkeyCredentialOverwriteChallenge.solved, false)
  })

  void it('POST accepts a forged signature and solves passkeySignatureChallenge', async () => {
    challenges.passkeySignatureChallenge.solved = false
    const { challenge, authToken } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: true, counter: 2 })

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken })

    assert.equal(res.status, 200)
    assert.equal(typeof res.body.authentication.token, 'string')
    assert.equal(res.body.authentication.umail, VICTIM_EMAIL)
    assert.equal(challenges.passkeySignatureChallenge.solved, true)
  })

  void it('POST accepts a signature with a single flipped bit and solves passkeySignatureChallenge', async () => {
    challenges.passkeySignatureChallenge.solved = false
    const { challenge, authToken } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: false, counter: 3 })
    // The last byte belongs to the DER-encoded `s` integer, so the signature stays well-formed.
    assertion.response.signature = flipBit(assertion.response.signature, -1)

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken })

    assert.equal(res.status, 200)
    assert.equal(res.body.authentication.umail, VICTIM_EMAIL)
    assert.equal(challenges.passkeySignatureChallenge.solved, true)
  })

  void it('POST rejects a signature whose DER structure is broken without solving the challenge', async () => {
    challenges.passkeySignatureChallenge.solved = false
    const { challenge, authToken } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: false, counter: 4 })
    // 0x30 (SEQUENCE) -> 0x31: the library cannot parse the signature at all and throws.
    assertion.response.signature = flipBit(assertion.response.signature, 0)

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken })

    assert.equal(res.status, 500)
    assert.equal(res.body.authentication, undefined)
    assert.equal(challenges.passkeySignatureChallenge.solved, false)
  })

  void it('POST accepts a genuine assertion without the user-verification flag', async () => {
    challenges.passkeySignatureChallenge.solved = false
    const { challenge, authToken } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: false, counter: 5, flags: 0x01 }) // UP only

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken })

    assert.equal(res.status, 200)
    assert.equal(challenges.passkeySignatureChallenge.solved, false)
  })

  void it('POST verifies a genuine assertion on whatever origin the shop is served from', async () => {
    challenges.passkeySignatureChallenge.solved = false
    const headers = { ...jsonHeader, host: 'shop.example.com:8080' }
    const { challenge, authToken } = await loginOptions(headers)
    const assertion = buildAssertion(victim, challenge, { tamper: false, counter: 6, origin: 'http://shop.example.com:8080' })

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(headers)
      .send({ assertion, authToken })

    assert.equal(res.status, 200)
    assert.equal(challenges.passkeySignatureChallenge.solved, false)
  })

  void it('POST derives the origin from X-Forwarded-* headers behind a reverse proxy', async () => {
    challenges.passkeySignatureChallenge.solved = false
    const headers = { ...jsonHeader, host: 'internal:3000', 'x-forwarded-proto': 'https', 'x-forwarded-host': 'juice.example.org' }
    const { challenge, authToken } = await loginOptions(headers)
    const assertion = buildAssertion(victim, challenge, { tamper: false, counter: 7, origin: 'https://juice.example.org' })

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(headers)
      .send({ assertion, authToken })

    assert.equal(res.status, 200)
    assert.equal(challenges.passkeySignatureChallenge.solved, false)
  })

  void it('POST rejects an assertion created for a different origin', async () => {
    const { challenge, authToken } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: false, counter: 8, origin: 'http://evil.example:3000' })

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken })

    assert.equal(res.status, 500)
    assert.equal(res.body.authentication, undefined)
  })

  void it('POST returns 401 for a missing authToken', async () => {
    const { challenge } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: false })

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(jsonHeader)
      .send({ assertion })

    assert.equal(res.status, 401)
  })

  void it('POST returns 401 for an authToken signed like a session token', async () => {
    const { challenge } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: false })
    const authToken = security.authorize({ challenge, type: 'passkey_auth' })

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken })

    assert.equal(res.status, 401)
  })

  void it('POST returns 401 for an unknown credential ID', async () => {
    const { challenge, authToken } = await loginOptions()
    const assertion = buildAssertion(victim, challenge, { tamper: false })
    assertion.id = 'this-credential-does-not-exist'

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken })

    assert.equal(res.status, 401)
    assert.equal(res.text, 'No account found for this passkey.')
  })

  void it('POST returns 401 for a missing assertion', async () => {
    const { authToken } = await loginOptions()

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(jsonHeader)
      .send({ authToken })

    assert.equal(res.status, 401)
  })
})

void describe('/rest/passkey/register-options', () => {
  void it('GET offers only classic algorithms and preferred user verification', async () => {
    const { token } = await login(app, { email: 'jim@juice-sh.op', password: 'ncc-1701' })
    const res = await request(app)
      .get('/rest/passkey/register-options')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })

    assert.equal(res.status, 200)
    assert.deepEqual(res.body.options.pubKeyCredParams.map((p: { alg: number }) => p.alg), [-8, -7, -257]) // EdDSA, ES256, RS256
    assert.equal(res.body.options.authenticatorSelection.userVerification, 'preferred')
    assert.equal(res.body.options.rp.id, 'localhost')
  })
})

void describe('/rest/passkey/register-verify', () => {
  async function attackerContext () {
    const { token } = await login(app, { email: 'jim@juice-sh.op', password: 'ncc-1701' })
    const optionsRes = await request(app)
      .get('/rest/passkey/register-options')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })
    return { token, challenge: optionsRes.body.options.challenge as string, regToken: optionsRes.body.regToken as string }
  }

  void it('POST overwrites the victim credential without solving passkeyCredentialOverwriteChallenge yet', async () => {
    challenges.passkeyCredentialOverwriteChallenge.solved = false
    const { token, challenge, regToken } = await attackerContext()
    const { attestation, publicKey } = buildAttestation(victim.credentialID, challenge)

    const res = await request(app)
      .post('/rest/passkey/register-verify')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })
      .send({ attestation, regToken })

    assert.equal(res.status, 200)
    assert.equal(res.body.verified, true)

    const row = await PasskeyModel.findOne({ where: { credentialID: victim.credentialID } })
    assert.ok(row)
    assert.equal(row.publicKey, publicKey)
    assert.equal(challenges.passkeyCredentialOverwriteChallenge.solved, false)
  })

  void it('POST then signing in with the attacker key solves passkeyCredentialOverwriteChallenge', async () => {
    challenges.passkeyCredentialOverwriteChallenge.solved = false
    challenges.passkeySignatureChallenge.solved = false
    const { token, challenge, regToken } = await attackerContext()
    const { attestation, privateKeyPem } = buildAttestation(victim.credentialID, challenge)
    await request(app)
      .post('/rest/passkey/register-verify')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })
      .send({ attestation, regToken })
    assert.equal(challenges.passkeyCredentialOverwriteChallenge.solved, false)

    // The stored public key now belongs to the attacker, so a genuinely signed login succeeds.
    const optionsRes = await request(app)
      .post('/rest/passkey/login-options')
      .set(jsonHeader)
      .send({ email: VICTIM_EMAIL })
    const assertion = buildAssertion({ ...victim, privateKeyPem }, optionsRes.body.options.challenge, { tamper: false })

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken: optionsRes.body.authToken })

    assert.equal(res.status, 200)
    assert.equal(res.body.authentication.umail, VICTIM_EMAIL)
    assert.equal(challenges.passkeyCredentialOverwriteChallenge.solved, true)
    assert.equal(challenges.passkeySignatureChallenge.solved, false)
  })

  void it('POST then signing in with a newly added victim passkey does not solve passkeyCredentialOverwriteChallenge', async () => {
    challenges.passkeyCredentialOverwriteChallenge.solved = false
    const { token } = await login(app, { email: VICTIM_EMAIL, password: 'FeuLJY3w9zXsGas9HeDNK2aDYARxc42HaKinEyZnqLcdqi8E' })
    const optionsRes = await request(app)
      .get('/rest/passkey/register-options')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })
    const credentialID = isoBase64URL.fromBuffer(crypto.randomBytes(32))
    const { attestation, privateKeyPem } = buildAttestation(credentialID, optionsRes.body.options.challenge)
    await request(app)
      .post('/rest/passkey/register-verify')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })
      .send({ attestation, regToken: optionsRes.body.regToken })

    const loginOptionsRes = await request(app)
      .post('/rest/passkey/login-options')
      .set(jsonHeader)
      .send({})
    const assertion = buildAssertion({ ...victim, credentialID, privateKeyPem }, loginOptionsRes.body.options.challenge, { tamper: false })

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken: loginOptionsRes.body.authToken })

    assert.equal(res.status, 200)
    assert.equal(res.body.authentication.umail, VICTIM_EMAIL)
    assert.equal(challenges.passkeyCredentialOverwriteChallenge.solved, false)
  })

  void it('POST accepts a forged signature for a non-victim passkey without solving passkeySignatureChallenge', async () => {
    challenges.passkeySignatureChallenge.solved = false
    const { token, challenge, regToken } = await attackerContext()
    const credentialID = isoBase64URL.fromBuffer(crypto.randomBytes(32))
    const { attestation } = buildAttestation(credentialID, challenge)
    await request(app)
      .post('/rest/passkey/register-verify')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })
      .send({ attestation, regToken })

    const optionsRes = await request(app)
      .post('/rest/passkey/login-options')
      .set(jsonHeader)
      .send({})
    const assertion = buildAssertion({ ...victim, credentialID }, optionsRes.body.options.challenge, { tamper: true })

    const res = await request(app)
      .post('/rest/passkey/login-verify')
      .set(jsonHeader)
      .send({ assertion, authToken: optionsRes.body.authToken })

    assert.equal(res.status, 200)
    assert.equal(res.body.authentication.umail, 'jim@juice-sh.op')
    assert.equal(challenges.passkeySignatureChallenge.solved, false)
  })

  void it('POST registers a new passkey without the user-verification flag', async () => {
    const { token, challenge, regToken } = await attackerContext()
    const credentialID = isoBase64URL.fromBuffer(crypto.randomBytes(32))
    const { attestation } = buildAttestation(credentialID, challenge, { flags: 0x41 }) // UP | AT

    const res = await request(app)
      .post('/rest/passkey/register-verify')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })
      .send({ attestation, regToken })

    assert.equal(res.status, 200)
    assert.equal(res.body.verified, true)
  })

  void it('POST stores the AAGUID of the passkey provider and lists it with the creation date', async () => {
    const { token, challenge, regToken } = await attackerContext()
    const credentialID = isoBase64URL.fromBuffer(crypto.randomBytes(32))
    const aaguid = 'bada5566-a7aa-401f-bd96-45619a55120d'
    const { attestation } = buildAttestation(credentialID, challenge, { aaguid })

    await request(app)
      .post('/rest/passkey/register-verify')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })
      .send({ attestation, regToken })
      .expect(200)

    const res = await request(app)
      .get('/rest/passkey/credentials')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })

    const registered = res.body.data.find((c: { credentialID: string }) => c.credentialID === credentialID)
    assert.equal(registered.aaguid, aaguid)
    assert.ok(!Number.isNaN(Date.parse(registered.createdAt)))
  })

  void it('POST returns 401 when unauthenticated', async () => {
    const { challenge } = await attackerContext()
    const { attestation } = buildAttestation(victim.credentialID, challenge)
    const regToken = security.authorize({ userId: 0, challenge, type: 'passkey_reg' })

    const res = await request(app)
      .post('/rest/passkey/register-verify')
      .set(jsonHeader)
      .send({ attestation, regToken })

    assert.equal(res.status, 401)
  })

  void it('POST returns 401 for a regToken of the wrong type', async () => {
    const { token, challenge } = await attackerContext()
    const { attestation } = buildAttestation(victim.credentialID, challenge)
    const { body: { authToken: regToken } } = await request(app)
      .post('/rest/passkey/login-options')
      .set(jsonHeader)
      .send({})

    const res = await request(app)
      .post('/rest/passkey/register-verify')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })
      .send({ attestation, regToken })

    assert.equal(res.status, 401)
  })
})

void describe('/rest/passkey/credentials', () => {
  void it('GET returns 401 when not logged in', async () => {
    const res = await request(app).get('/rest/passkey/credentials')
    assert.equal(res.status, 401)
  })

  void it('GET lists the logged-in user\'s passkeys', async () => {
    const { token } = await login(app, { email: VICTIM_EMAIL, password: 'FeuLJY3w9zXsGas9HeDNK2aDYARxc42HaKinEyZnqLcdqi8E' })

    const res = await request(app)
      .get('/rest/passkey/credentials')
      .set({ Authorization: 'Bearer ' + token, ...jsonHeader })

    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.body.data))
    assert.ok(res.body.data.some((c: { credentialID: string }) => c.credentialID === victim.credentialID))
  })
})

void describe('/.well-known/passkey-endpoints', () => {
  void it('GET returns enroll and manage URLs for the requesting origin', async () => {
    const res = await request(app)
      .get('/.well-known/passkey-endpoints')
      .set({ host: 'shop.example.com:8080', 'x-forwarded-proto': 'https' })

    assert.equal(res.status, 200)
    assert.match(res.headers['content-type'], /application\/json/)
    assert.deepEqual(res.body, {
      enroll: 'https://shop.example.com:8080/#/privacy-security/passkeys',
      manage: 'https://shop.example.com:8080/#/privacy-security/passkeys'
    })
  })
})
