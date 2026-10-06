/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import { type Request, type Response } from 'express'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server'
import { COSEALG, isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers'

import { AuthenticatorModel } from '../models/authenticator'
import { BasketModel } from '../models/basket'
import { UserModel } from '../models/user'
import * as challengeUtils from '../lib/challengeUtils'
import { challenges, users } from '../data/datacache'
import { loadStaticUserData } from '../data/staticData'
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

  const existing = await AuthenticatorModel.findAll({ where: { UserId: user.id } })
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: user.email,
    userID: isoUint8Array.fromUTF8String(String(user.id)),
    attestationType: 'none',
    excludeCredentials: existing.map((authenticator) => ({
      id: authenticator.credentialID,
      transports: authenticator.transports ? authenticator.transports.split(',') : undefined
    })),
    authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
    supportedAlgorithmIDs
  })

  const regToken = security.authorize({ userId: user.id, challenge: options.challenge, type: 'webauthn_reg' })
  res.json({ options, regToken })
}

// vuln-code-snippet start webauthnCredentialOverwriteChallenge
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

  const decoded = security.verify(regToken) && security.decode(regToken)
  if (!decoded || decoded.type !== 'webauthn_reg' || decoded.userId !== user.id) {
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

  const { credential } = verification.registrationInfo
  const credentialID = credential.id
  const publicKey = isoBase64URL.fromBuffer(credential.publicKey)
  const transports = (attestation.response?.transports ?? []).join(',')

  const existing = await AuthenticatorModel.findOne({ where: { credentialID } }) // vuln-code-snippet vuln-line webauthnCredentialOverwriteChallenge
  if (existing) { // vuln-code-snippet vuln-line webauthnCredentialOverwriteChallenge
    existing.publicKey = publicKey // vuln-code-snippet vuln-line webauthnCredentialOverwriteChallenge
    existing.counter = credential.counter
    existing.transports = transports
    await existing.save()
  } else {
    await AuthenticatorModel.create({ UserId: user.id, credentialID, publicKey, counter: credential.counter, transports })
  }

  res.json({ verified: true })
}
// vuln-code-snippet end webauthnCredentialOverwriteChallenge

/**
 * Start a passkey sign-in, either usernameless (discoverable credentials) or username-first.
 */
export async function loginOptions (req: Request, res: Response) {
  const { email } = req.body
  const { rpID } = relyingParty(req)

  let allowCredentials
  if (email) {
    const user = await UserModel.findOne({ where: { email } })
    if (user) {
      const authenticators = await AuthenticatorModel.findAll({ where: { UserId: user.id } })
      allowCredentials = authenticators.map((authenticator) => ({
        id: authenticator.credentialID,
        transports: authenticator.transports ? authenticator.transports.split(',') : undefined
      }))
    }
  }

  const options = await generateAuthenticationOptions({ rpID, allowCredentials, userVerification: 'preferred' })
  const authToken = security.authorize({ challenge: options.challenge, type: 'webauthn_auth' })
  res.json({ options, authToken })
}

// vuln-code-snippet start webauthnSignatureChallenge
/**
 * Verify a passkey assertion and sign the user in.
 */
export async function loginVerify (req: Request, res: Response) {
  const { assertion, authToken } = req.body
  const { rpID, origin } = relyingParty(req)

  const decoded = security.verify(authToken) && security.decode(authToken)
  if (!decoded || decoded.type !== 'webauthn_auth') {
    res.status(401).send()
    return
  }

  const authenticator = await AuthenticatorModel.findOne({ where: { credentialID: assertion?.id } })
  if (!authenticator) {
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
      id: authenticator.credentialID,
      publicKey: isoBase64URL.toBuffer(authenticator.publicKey),
      counter: authenticator.counter,
      transports: authenticator.transports ? authenticator.transports.split(',') as any : undefined
    }
  })

  const user = await UserModel.findByPk(authenticator.UserId)
  if (!user) {
    res.status(401).send(res.__('No account found for this passkey.'))
    return
  }

  challengeUtils.solveIf(challenges.webauthnSignatureChallenge, () => { return user.id === users.passkeyUser.id && !verification.verified }) // vuln-code-snippet hide-line
  await solvePasskeyHijack(user, authenticator, verification.verified) // vuln-code-snippet hide-line
  await issuePasskeySession(user, res) // vuln-code-snippet vuln-line webauthnSignatureChallenge

  if (verification.verified) {
    authenticator.counter = verification.authenticationInfo.newCounter
    await authenticator.save()
  }
}
// vuln-code-snippet end webauthnSignatureChallenge

// Logging in with the original seeded passkey does not count, its public key must have been replaced.
async function solvePasskeyHijack (user: UserModel, authenticator: AuthenticatorModel, verified: boolean) {
  if (!verified || user.id !== users.passkeyUser.id || !challengeUtils.notSolved(challenges.webauthnCredentialOverwriteChallenge)) return
  const seeded = (await loadStaticUserData()).find(({ key }) => key === 'passkeyUser')?.passkeys ?? []
  challengeUtils.solveIf(challenges.webauthnCredentialOverwriteChallenge, () => {
    return !seeded.some(({ credentialID, publicKey }) => credentialID === authenticator.credentialID && publicKey === authenticator.publicKey)
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
  const authenticators = await AuthenticatorModel.findAll({ where: { UserId: data.data.id } })
  res.json({
    data: authenticators.map((authenticator) => ({
      id: authenticator.id,
      credentialID: authenticator.credentialID,
      transports: authenticator.transports
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
  await AuthenticatorModel.destroy({ where: { id: req.params.id, UserId: data.data.id } })
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
