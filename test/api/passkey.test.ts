/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import crypto from 'node:crypto'
import { describe, it, before, mock } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'
import { login } from './helpers/auth'
import { isoBase64URL } from '@simplewebauthn/server/helpers'
import { buildAssertion, buildAttestation, flipBit, loadVictimCredential, type VictimCredential } from './helpers/passkey'
import { PasskeyModel } from '../../models/passkey'
import { challenges } from '../../data/datacache'
import * as security from '../../lib/insecurity'

// The relying party is derived from the request, so pin the Host the crafted payloads are bound to.
const jsonHeader: Record<string, string> = { 'content-type': 'application/json', host: 'localhost:3000' }
const VICTIM = { email: 'passkey-user@juice-sh.op', password: 'FeuLJY3w9zXsGas9HeDNK2aDYARxc42HaKinEyZnqLcdqi8E' }
const JIM = { email: 'jim@juice-sh.op', password: 'ncc-1701' }

let app: Express
const victim = loadVictimCredential()

const bearer = (token: string) => ({ Authorization: 'Bearer ' + token, ...jsonHeader })
const randomCredentialID = () => isoBase64URL.fromBuffer(crypto.randomBytes(32))

// The library rejects sign counters that do not increase, so every assertion gets a fresh one.
let signCount = 0
function sign (credential: VictimCredential, challenge: string, options: Partial<Parameters<typeof buildAssertion>[2]> = {}) {
  return buildAssertion(credential, challenge, { tamper: false, counter: ++signCount, ...options })
}

async function loginOptions (body: object = { email: VICTIM.email }, headers = jsonHeader) {
  const res = await request(app)
    .post('/rest/passkey/login-options')
    .set(headers)
    .send(body)
  return { challenge: res.body.options.challenge as string, authToken: res.body.authToken as string }
}

function loginVerify (body: object, headers = jsonHeader) {
  return request(app)
    .post('/rest/passkey/login-verify')
    .set(headers)
    .send(body)
}

async function registerOptions (token: string) {
  const res = await request(app)
    .get('/rest/passkey/register-options')
    .set(bearer(token))
  return { challenge: res.body.options.challenge as string, regToken: res.body.regToken as string }
}

function registerVerify (token: string, body: object) {
  return request(app)
    .post('/rest/passkey/register-verify')
    .set(bearer(token))
    .send(body)
}

async function registerPasskey (token: string, credentialID = randomCredentialID(), options?: Parameters<typeof buildAttestation>[2]) {
  const { challenge, regToken } = await registerOptions(token)
  const forged = buildAttestation(credentialID, challenge, options)
  const res = await registerVerify(token, { attestation: forged.attestation, regToken })
  return { ...forged, credentialID, res }
}

function listCredentials (token: string) {
  return request(app)
    .get('/rest/passkey/credentials')
    .set(bearer(token))
}

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/rest/passkey/login-options', () => {
  void it('POST leaks the matching credential IDs when an email is supplied', async () => {
    const res = await request(app)
      .post('/rest/passkey/login-options')
      .set(jsonHeader)
      .send({ email: VICTIM.email })

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
    for (const email of [[VICTIM.email, JIM.email], { foo: 1 }]) {
      const res = await request(app)
        .post('/rest/passkey/login-options')
        .set(jsonHeader)
        .send({ email })

      assert.equal(res.status, 200)
      assert.equal(res.body.options.allowCredentials, undefined)
    }
  })

  void it('POST returns an authToken that is not accepted as a session token', async () => {
    const { authToken } = await loginOptions({})

    const res = await request(app)
      .get('/api/Users')
      .set({ Authorization: 'Bearer ' + authToken })

    assert.equal(res.status, 401)
  })
})

void describe('/rest/passkey/login-verify', () => {
  void it('POST signs the user in for a genuine assertion without solving any challenge', async () => {
    challenges.passkeySignatureChallenge.solved = false
    challenges.passkeyCredentialOverwriteChallenge.solved = false
    const { challenge, authToken } = await loginOptions()
    const assertion = sign(victim, challenge)

    const res = await loginVerify({ assertion, authToken })

    assert.equal(res.status, 200)
    assert.equal(typeof res.body.authentication.token, 'string')
    assert.equal(res.body.authentication.umail, VICTIM.email)
    assert.equal(challenges.passkeySignatureChallenge.solved, false)
    assert.equal(challenges.passkeyCredentialOverwriteChallenge.solved, false)
  })

  void it('POST stores the sign counter of a genuine assertion and rejects a replayed one', async () => {
    const first = await loginOptions()
    await loginVerify({ assertion: sign(victim, first.challenge), authToken: first.authToken }).expect(200)

    const row = await PasskeyModel.findOne({ where: { credentialID: victim.credentialID } })
    assert.equal(row?.counter, signCount)

    const second = await loginOptions()
    const replayed = buildAssertion(victim, second.challenge, { tamper: false, counter: signCount })
    const res = await loginVerify({ assertion: replayed, authToken: second.authToken })

    assert.equal(res.status, 500)
    assert.equal(res.body.authentication, undefined)
  })

  void it('POST accepts an invalid signature and solves passkeySignatureChallenge', async () => {
    const invalidSignatures = {
      'signed with a different key': (challenge: string) => sign(victim, challenge, { tamper: true }),
      // The last byte belongs to the DER-encoded `s` integer, so the signature stays well-formed.
      'single flipped bit': (challenge: string) => {
        const assertion = sign(victim, challenge)
        assertion.response.signature = flipBit(assertion.response.signature, -1)
        return assertion
      }
    }
    for (const [name, forge] of Object.entries(invalidSignatures)) {
      challenges.passkeySignatureChallenge.solved = false
      const { challenge, authToken } = await loginOptions()

      const res = await loginVerify({ assertion: forge(challenge), authToken })

      assert.equal(res.status, 200, name)
      assert.equal(res.body.authentication.umail, VICTIM.email, name)
      assert.equal(challenges.passkeySignatureChallenge.solved, true, name)
    }
  })

  void it('POST accepts a forged signature for a non-victim passkey without solving passkeySignatureChallenge', async () => {
    challenges.passkeySignatureChallenge.solved = false
    const { token } = await login(app, JIM)
    const { credentialID } = await registerPasskey(token)
    const { challenge, authToken } = await loginOptions({})

    const res = await loginVerify({ assertion: sign({ ...victim, credentialID }, challenge, { tamper: true }), authToken })

    assert.equal(res.status, 200)
    assert.equal(res.body.authentication.umail, JIM.email)
    assert.equal(challenges.passkeySignatureChallenge.solved, false)
  })

  void it('POST signs in with a newly added victim passkey without solving passkeyCredentialOverwriteChallenge', async () => {
    challenges.passkeyCredentialOverwriteChallenge.solved = false
    const { token } = await login(app, VICTIM)
    const { credentialID, privateKeyPem } = await registerPasskey(token)
    const { challenge, authToken } = await loginOptions({})

    const res = await loginVerify({ assertion: sign({ ...victim, credentialID, privateKeyPem }, challenge), authToken })

    assert.equal(res.status, 200)
    assert.equal(res.body.authentication.umail, VICTIM.email)
    assert.equal(challenges.passkeyCredentialOverwriteChallenge.solved, false)
  })

  void it('POST rejects a signature whose DER structure is broken without solving the challenge', async () => {
    challenges.passkeySignatureChallenge.solved = false
    const { challenge, authToken } = await loginOptions()
    const assertion = sign(victim, challenge)
    // 0x30 (SEQUENCE) -> 0x31: the library cannot parse the signature at all and throws.
    assertion.response.signature = flipBit(assertion.response.signature, 0)

    const res = await loginVerify({ assertion, authToken })

    assert.equal(res.status, 500)
    assert.equal(res.body.authentication, undefined)
    assert.equal(challenges.passkeySignatureChallenge.solved, false)
  })

  void it('POST accepts a genuine assertion without the user-verification flag', async () => {
    challenges.passkeySignatureChallenge.solved = false
    const { challenge, authToken } = await loginOptions()

    const res = await loginVerify({ assertion: sign(victim, challenge, { flags: 0x01 }), authToken }) // UP only

    assert.equal(res.status, 200)
    assert.equal(challenges.passkeySignatureChallenge.solved, false)
  })

  void it('POST verifies a genuine assertion on whatever origin the shop is served from', async () => {
    const origins = {
      'http://shop.example.com:8080': { host: 'shop.example.com:8080' },
      'https://juice.example.org': { host: 'internal:3000', 'x-forwarded-proto': 'https', 'x-forwarded-host': 'juice.example.org' }
    }
    for (const [origin, originHeaders] of Object.entries(origins)) {
      challenges.passkeySignatureChallenge.solved = false
      const headers = { ...jsonHeader, ...originHeaders }
      const { challenge, authToken } = await loginOptions(undefined, headers)

      const res = await loginVerify({ assertion: sign(victim, challenge, { origin }), authToken }, headers)

      assert.equal(res.status, 200, origin)
      assert.equal(challenges.passkeySignatureChallenge.solved, false, origin)
    }
  })

  void it('POST rejects an assertion created for a different origin', async () => {
    const { challenge, authToken } = await loginOptions()

    const res = await loginVerify({ assertion: sign(victim, challenge, { origin: 'http://evil.example:3000' }), authToken })

    assert.equal(res.status, 500)
    assert.equal(res.body.authentication, undefined)
  })

  void it('POST returns 401 for a missing or unacceptable authToken or assertion', async () => {
    const { challenge, authToken } = await loginOptions()
    const assertion = sign(victim, challenge)
    const { token } = await login(app, JIM)
    const { regToken } = await registerOptions(token)
    const bodies = {
      'missing authToken': { assertion },
      'authToken signed like a session token': { assertion, authToken: security.authorize({ challenge, type: 'passkey_auth' }) },
      'regToken instead of an authToken': { assertion, authToken: regToken },
      'missing assertion': { authToken }
    }
    for (const [name, body] of Object.entries(bodies)) {
      const res = await loginVerify(body)

      assert.equal(res.status, 401, name)
    }
  })

  void it('POST returns 401 for an expired authToken', async (t) => {
    const { challenge, authToken } = await loginOptions()
    const assertion = sign(victim, challenge)
    mock.timers.enable({ apis: ['Date'], now: Date.now() + 6 * 60 * 1000 })
    t.after(() => { mock.timers.reset() })

    const res = await loginVerify({ assertion, authToken })

    assert.equal(res.status, 401)
  })

  void it('POST returns 401 for an unknown credential ID', async () => {
    const { challenge, authToken } = await loginOptions()
    const assertion = sign(victim, challenge)
    assertion.id = 'this-credential-does-not-exist'

    const res = await loginVerify({ assertion, authToken })

    assert.equal(res.status, 401)
    assert.equal(res.text, 'No account found for this passkey.')
  })
})

void describe('/rest/passkey/register-options', () => {
  void it('GET offers only classic algorithms and preferred user verification', async () => {
    const { token } = await login(app, JIM)
    const res = await request(app)
      .get('/rest/passkey/register-options')
      .set(bearer(token))

    assert.equal(res.status, 200)
    assert.deepEqual(res.body.options.pubKeyCredParams.map((p: { alg: number }) => p.alg), [-8, -7, -257]) // EdDSA, ES256, RS256
    assert.equal(res.body.options.authenticatorSelection.userVerification, 'preferred')
    assert.equal(res.body.options.rp.id, 'localhost')
  })

  void it('GET excludes the passkeys the user has already registered', async () => {
    const { token } = await login(app, VICTIM)
    const res = await request(app)
      .get('/rest/passkey/register-options')
      .set(bearer(token))

    assert.equal(res.status, 200)
    const ids = res.body.options.excludeCredentials.map((c: { id: string }) => c.id)
    assert.ok(ids.includes(victim.credentialID))
  })

  void it('GET returns 401 when not logged in', async () => {
    const res = await request(app)
      .get('/rest/passkey/register-options')
      .set(jsonHeader)

    assert.equal(res.status, 401)
  })
})

void describe('/rest/passkey/register-verify', () => {
  void it('POST overwrites the victim credential and signing in with the attacker key solves passkeyCredentialOverwriteChallenge', async (t) => {
    challenges.passkeyCredentialOverwriteChallenge.solved = false
    challenges.passkeySignatureChallenge.solved = false
    t.after(async () => { await PasskeyModel.update({ publicKey: victim.publicKeyCose }, { where: { credentialID: victim.credentialID } }) })
    const { token } = await login(app, JIM)

    const { res, publicKey, privateKeyPem } = await registerPasskey(token, victim.credentialID)

    assert.equal(res.status, 200)
    assert.equal(res.body.verified, true)
    const row = await PasskeyModel.findOne({ where: { credentialID: victim.credentialID } })
    assert.equal(row?.publicKey, publicKey)
    assert.equal(challenges.passkeyCredentialOverwriteChallenge.solved, false)

    // The stored public key now belongs to the attacker, so a genuinely signed login succeeds.
    const { challenge, authToken } = await loginOptions()
    const loginRes = await loginVerify({ assertion: sign({ ...victim, privateKeyPem }, challenge), authToken })

    assert.equal(loginRes.status, 200)
    assert.equal(loginRes.body.authentication.umail, VICTIM.email)
    assert.equal(challenges.passkeyCredentialOverwriteChallenge.solved, true)
    assert.equal(challenges.passkeySignatureChallenge.solved, false)
  })

  void it('POST registers a new passkey without the user-verification flag', async () => {
    const { token } = await login(app, JIM)

    const { res } = await registerPasskey(token, undefined, { flags: 0x41 }) // UP | AT

    assert.equal(res.status, 200)
    assert.equal(res.body.verified, true)
  })

  void it('POST stores the AAGUID of the passkey provider and lists it with the creation date', async () => {
    const { token } = await login(app, JIM)
    const aaguid = 'bada5566-a7aa-401f-bd96-45619a55120d'
    const { credentialID } = await registerPasskey(token, undefined, { aaguid })

    const res = await listCredentials(token)

    const registered = res.body.data.find((c: { credentialID: string }) => c.credentialID === credentialID)
    assert.equal(registered.aaguid, aaguid)
    assert.ok(!Number.isNaN(Date.parse(registered.createdAt)))
  })

  void it('POST returns 400 for an attestation whose signature does not verify', async () => {
    const { token } = await login(app, JIM)
    const sig = crypto.sign('sha256', Buffer.from('not the attested data'), { key: crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey, dsaEncoding: 'der' })

    const { res, credentialID } = await registerPasskey(token, undefined, { fmt: 'packed', attStmt: new Map<string, number | Buffer>([['alg', -7], ['sig', sig]]) })

    assert.equal(res.status, 400)
    assert.equal(res.body.error, 'not verified')
    assert.equal(await PasskeyModel.count({ where: { credentialID } }), 0)
  })

  void it('POST rejects an attestation created for a different origin or challenge', async () => {
    const { token } = await login(app, JIM)
    const { challenge, regToken } = await registerOptions(token)
    const credentialID = randomCredentialID()
    const attestations = {
      'different origin': buildAttestation(credentialID, challenge, { origin: 'http://evil.example:3000' }).attestation,
      'different challenge': buildAttestation(credentialID, isoBase64URL.fromBuffer(crypto.randomBytes(32))).attestation
    }
    for (const [name, attestation] of Object.entries(attestations)) {
      const res = await registerVerify(token, { attestation, regToken })

      assert.equal(res.status, 500, name)
    }
    assert.equal(await PasskeyModel.count({ where: { credentialID } }), 0)
  })

  void it('POST returns 401 for a missing or unacceptable regToken without touching the victim credential', async () => {
    const { token } = await login(app, JIM)
    const { challenge, regToken } = await registerOptions(token)
    const { userId } = JSON.parse(Buffer.from(regToken.split('.')[1], 'base64url').toString())
    const { attestation } = buildAttestation(victim.credentialID, challenge)
    const victimSession = await login(app, VICTIM)
    const regTokens = {
      'missing regToken': undefined,
      'regToken signed like a session token': security.authorize({ userId, challenge, type: 'passkey_reg' }),
      'authToken instead of a regToken': (await loginOptions({})).authToken,
      'regToken issued to a different user': (await registerOptions(victimSession.token)).regToken
    }
    for (const [name, unacceptable] of Object.entries(regTokens)) {
      const res = await registerVerify(token, { attestation, regToken: unacceptable })

      assert.equal(res.status, 401, name)
    }
    const row = await PasskeyModel.findOne({ where: { credentialID: victim.credentialID } })
    assert.equal(row?.publicKey, victim.publicKeyCose)
  })

  void it('POST returns 401 when not logged in', async () => {
    const res = await request(app)
      .post('/rest/passkey/register-verify')
      .set(jsonHeader)
      .send({})

    assert.equal(res.status, 401)
  })
})

void describe('/rest/passkey/credentials', () => {
  void it('GET returns 401 when not logged in', async () => {
    const res = await request(app).get('/rest/passkey/credentials')
    assert.equal(res.status, 401)
  })

  void it('GET lists only the passkeys of the logged-in user', async () => {
    const jim = await login(app, JIM)
    const { credentialID } = await registerPasskey(jim.token)
    const victimSession = await login(app, VICTIM)
    const ids = (res: request.Response) => res.body.data.map((c: { credentialID: string }) => c.credentialID)

    const jimRes = await listCredentials(jim.token)
    const victimRes = await listCredentials(victimSession.token)

    assert.equal(jimRes.status, 200)
    assert.ok(ids(jimRes).includes(credentialID))
    assert.ok(!ids(jimRes).includes(victim.credentialID))
    assert.equal(victimRes.status, 200)
    assert.ok(ids(victimRes).includes(victim.credentialID))
    assert.ok(!ids(victimRes).includes(credentialID))
  })

  void it('DELETE returns 401 when not logged in', async () => {
    const res = await request(app).delete('/rest/passkey/credentials/1')
    assert.equal(res.status, 401)
  })

  void it('DELETE removes a passkey of the logged-in user', async () => {
    const { token } = await login(app, JIM)
    const { credentialID } = await registerPasskey(token)
    const row = await PasskeyModel.findOne({ where: { credentialID } })

    const res = await request(app)
      .delete(`/rest/passkey/credentials/${row?.id}`)
      .set(bearer(token))

    assert.equal(res.status, 204)
    assert.equal(await PasskeyModel.count({ where: { credentialID } }), 0)
  })

  void it('DELETE does not remove a passkey of another user', async () => {
    const { token } = await login(app, JIM)
    const row = await PasskeyModel.findOne({ where: { credentialID: victim.credentialID } })

    const res = await request(app)
      .delete(`/rest/passkey/credentials/${row?.id}`)
      .set(bearer(token))

    assert.equal(res.status, 204)
    assert.equal(await PasskeyModel.count({ where: { credentialID: victim.credentialID } }), 1)
  })
})

void describe('/rest/passkey', () => {
  void it('returns 401 for a valid token that does not belong to a logged-in user', async () => {
    const headers = bearer(security.authorize())
    const responses = {
      'GET register-options': await request(app).get('/rest/passkey/register-options').set(headers),
      'POST register-verify': await request(app).post('/rest/passkey/register-verify').set(headers).send({}),
      'GET credentials': await request(app).get('/rest/passkey/credentials').set(headers),
      'DELETE credentials': await request(app).delete('/rest/passkey/credentials/1').set(headers)
    }
    for (const [name, res] of Object.entries(responses)) {
      assert.equal(res.status, 401, name)
    }
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
