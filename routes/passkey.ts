/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import crypto from 'node:crypto'
import config from 'config'
import { type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'
import jws from 'jws'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type AuthenticatorTransport
} from '@simplewebauthn/server'
import { COSEALG, isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers'

import { PasskeyModel } from '../models/passkey'
import { BasketModel } from '../models/basket'
import { UserModel } from '../models/user'
import * as challengeUtils from '../lib/challengeUtils'
import { challenges, users } from '../data/datacache'
import { loadStaticUserData, type StaticUserPasskey } from '../data/staticData'
import * as security from '../lib/insecurity'
import * as utils from '../lib/utils'

// Derived per request (honoring X-Forwarded-* via `trust proxy`) so passkeys work on whatever
// origin the shop is served from, not just the configured server.baseUrl.
function relyingParty (req: Request) {
  const host = (req.get('x-forwarded-host') ?? req.get('host') ?? '').split(',')[0].trim()
  return { rpID: req.hostname, origin: `${req.protocol}://${host}`, rpName: config.get<string>('application.name') }
}

// Pinned instead of the library default, which probes the runtime for experimental ML-DSA-44
// support and triggers Node's ExperimentalWarning. Must match between options and verification.
const supportedAlgorithmIDs = [COSEALG.EdDSA, COSEALG.ES256, COSEALG.RS256]

// Ceremony tokens are signed with their own per-process key, so unlike security.authorize() tokens
// they can never pass security.isAuthorized() as a session token.
const ceremonySecret = crypto.randomBytes(32).toString('hex')
const ceremonyTokenLifetime = 5 * 60

function signCeremonyToken (payload: Record<string, unknown>) {
  return jwt.sign({ ...payload, exp: Math.round(Date.now() / 1000) + ceremonyTokenLifetime }, ceremonySecret, { algorithm: 'HS256' })
}

function verifyCeremonyToken (token: unknown, type: string): Record<string, any> | undefined {
  if (typeof token !== 'string' || jws.decode(token)?.header?.alg !== 'HS256') return undefined
  let payload: Record<string, any> | undefined
  // jsonwebtoken@0.4.0 invokes the callback synchronously
  jwt.verify(token, ceremonySecret, (err: unknown, decoded: any) => { if (!err) payload = decoded })
  return payload?.type === type ? payload : undefined
}

function toTransports (passkey: PasskeyModel) {
  return passkey.transports ? passkey.transports.split(',') as AuthenticatorTransport[] : undefined
}

// A passkey sign-in mints the same JWT session a password login would, mirroring routes/login.ts.
async function issuePasskeySession (user: UserModel, res: Response) {
  const plainUser = utils.queryResultToJson(user).data
  const [basket] = await BasketModel.findOrCreate({ where: { UserId: user.id } })
  const authenticatedUser = { data: plainUser, bid: basket.id }
  const token = security.authorize(authenticatedUser)
  security.authenticatedUsers.put(token, authenticatedUser)
  res.json({ authentication: { token, bid: basket.id, umail: user.email } })
}

/**
 * Start registering a new passkey for the logged-in user.
 */
export async function registerOptions (req: Request, res: Response) {
  const data = security.authenticatedUsers.from(req)
  if (!data) {
    res.status(401).send()
    return
  }
  const { data: user } = data
  const { rpID, rpName } = relyingParty(req)

  const existing = await PasskeyModel.findAll({ where: { UserId: user.id } })
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: user.email,
    userID: isoUint8Array.fromUTF8String(String(user.id)),
    attestationType: 'none',
    excludeCredentials: existing.map((passkey) => ({
      id: passkey.credentialID,
      transports: toTransports(passkey)
    })),
    authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
    supportedAlgorithmIDs
  })

  const regToken = signCeremonyToken({ userId: user.id, challenge: options.challenge, type: 'passkey_reg' })
  res.json({ options, regToken })
}

// vuln-code-snippet start passkeyCredentialOverwriteChallenge
/**
 * Verify a passkey registration and persist the new credential.
 */
export async function registerVerify (req: Request, res: Response) {
  const data = security.authenticatedUsers.from(req)
  if (!data) {
    res.status(401).send()
    return
  }
  const { data: user } = data
  const { attestation, regToken } = req.body
  const { rpID, origin } = relyingParty(req)

  const decoded = verifyCeremonyToken(regToken, 'passkey_reg')
  if (!decoded || decoded.userId !== user.id) {
    res.status(401).send()
    return
  }

  const verification = await verifyRegistrationResponse({
    response: attestation,
    expectedChallenge: decoded.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
    supportedAlgorithmIDs
  })
  if (!verification.verified || !verification.registrationInfo) {
    res.status(400).json({ error: 'not verified' })
    return
  }

  const { credential, aaguid } = verification.registrationInfo
  const credentialID = credential.id
  const publicKey = isoBase64URL.fromBuffer(credential.publicKey)
  const transports = (attestation.response?.transports ?? []).join(',')

  const existing = await PasskeyModel.findOne({ where: { credentialID } }) // vuln-code-snippet neutral-line passkeyCredentialOverwriteChallenge
  if (existing) { // vuln-code-snippet neutral-line passkeyCredentialOverwriteChallenge
    existing.publicKey = publicKey // vuln-code-snippet vuln-line passkeyCredentialOverwriteChallenge
    existing.counter = credential.counter // vuln-code-snippet neutral-line passkeyCredentialOverwriteChallenge
    existing.transports = transports // vuln-code-snippet neutral-line passkeyCredentialOverwriteChallenge
    existing.aaguid = aaguid // vuln-code-snippet neutral-line passkeyCredentialOverwriteChallenge
    await existing.save() // vuln-code-snippet neutral-line passkeyCredentialOverwriteChallenge
  } else {
    await PasskeyModel.create({ UserId: user.id, credentialID, publicKey, counter: credential.counter, transports, aaguid })
  }

  res.json({ verified: true })
}
// vuln-code-snippet end passkeyCredentialOverwriteChallenge

/**
 * Start a passkey sign-in, either usernameless (discoverable credentials) or username-first.
 */
export async function loginOptions (req: Request, res: Response) {
  const { email } = req.body
  const { rpID } = relyingParty(req)

  let allowCredentials
  if (typeof email === 'string' && email) {
    const passkeys = await PasskeyModel.findAll({ include: [{ model: UserModel, where: { email }, attributes: [] }] })
    allowCredentials = passkeys.map((passkey) => ({
      id: passkey.credentialID,
      transports: toTransports(passkey)
    }))
  }

  const options = await generateAuthenticationOptions({ rpID, allowCredentials, userVerification: 'preferred' })
  const authToken = signCeremonyToken({ challenge: options.challenge, type: 'passkey_auth' })
  res.json({ options, authToken })
}

// vuln-code-snippet start passkeySignatureChallenge
/**
 * Verify a passkey assertion and sign the user in.
 */
export async function loginVerify (req: Request, res: Response) {
  const { assertion, authToken } = req.body
  const { rpID, origin } = relyingParty(req)

  const decoded = verifyCeremonyToken(authToken, 'passkey_auth')
  if (!decoded || typeof assertion?.id !== 'string') {
    res.status(401).send()
    return
  }

  const passkey = await PasskeyModel.findOne({ where: { credentialID: assertion.id } })
  if (!passkey) {
    res.status(401).send(res.__('No account found for this passkey.'))
    return
  }

  const verification = await verifyAuthenticationResponse({
    response: assertion,
    expectedChallenge: decoded.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
    credential: {
      id: passkey.credentialID,
      publicKey: isoBase64URL.toBuffer(passkey.publicKey),
      counter: passkey.counter,
      transports: toTransports(passkey)
    }
  })

  const user = await UserModel.findByPk(passkey.UserId)
  if (!user) {
    res.status(401).send(res.__('No account found for this passkey.'))
    return
  }

  challengeUtils.solveIf(challenges.passkeySignatureChallenge, () => { return user.id === users.passkeyUser.id && !verification.verified }) // vuln-code-snippet hide-line
  await solvePasskeyHijack(user, passkey, verification.verified) // vuln-code-snippet hide-line
  if (verification.verified) { // vuln-code-snippet neutral-line passkeySignatureChallenge
    passkey.counter = verification.authenticationInfo.newCounter // vuln-code-snippet neutral-line passkeySignatureChallenge
    await passkey.save() // vuln-code-snippet neutral-line passkeySignatureChallenge
  } // vuln-code-snippet neutral-line passkeySignatureChallenge
  await issuePasskeySession(user, res) // vuln-code-snippet vuln-line passkeySignatureChallenge
}
// vuln-code-snippet end passkeySignatureChallenge

let seededPasskeys: Promise<StaticUserPasskey[]> | undefined

// Only counts when a seeded credential ID now carries a different public key, i.e. it was overwritten.
async function solvePasskeyHijack (user: UserModel, passkey: PasskeyModel, verified: boolean) {
  if (!verified || user.id !== users.passkeyUser.id || !challengeUtils.notSolved(challenges.passkeyCredentialOverwriteChallenge)) return
  seededPasskeys ??= loadStaticUserData().then((staticUsers) => staticUsers.find(({ key }) => key === 'passkeyUser')?.passkeys ?? [])
  const seeded = await seededPasskeys
  challengeUtils.solveIf(challenges.passkeyCredentialOverwriteChallenge, () => {
    return seeded.some(({ credentialID, publicKey }) => credentialID === passkey.credentialID && publicKey !== passkey.publicKey)
  })
}

/**
 * List the logged-in user's passkeys (for the Manage Passkeys page).
 */
export async function listCredentials (req: Request, res: Response) {
  const data = security.authenticatedUsers.from(req)
  if (!data) {
    res.status(401).send()
    return
  }
  const passkeys = await PasskeyModel.findAll({ where: { UserId: data.data.id } })
  res.json({
    data: passkeys.map((passkey) => ({
      id: passkey.id,
      credentialID: passkey.credentialID,
      transports: passkey.transports,
      aaguid: passkey.aaguid,
      createdAt: passkey.createdAt
    }))
  })
}

/**
 * Remove one of the logged-in user's passkeys.
 */
export async function deleteCredential (req: Request, res: Response) {
  const data = security.authenticatedUsers.from(req)
  if (!data) {
    res.status(401).send()
    return
  }
  await PasskeyModel.destroy({ where: { id: req.params.id, UserId: data.data.id } })
  res.status(204).send()
}

/**
 * Passkey Endpoints well-known URL (https://w3c.github.io/webappsec-passkey-endpoints/) so password
 * managers can deep-link users to passkey enrollment and management.
 */
export function passkeyEndpoints (req: Request, res: Response) {
  const url = `${relyingParty(req).origin}/#/privacy-security/passkeys`
  res.json({ enroll: url, manage: url })
}
