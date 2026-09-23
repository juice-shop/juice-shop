/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { createPrivateKey, createPublicKey } from 'node:crypto'

export function loadJwtKeys (pem: string | undefined) {
  if (!pem?.trim()) {
    throw new Error('JWT_PRIVATE_KEY must contain an RSA private key in PEM format')
  }

  let key
  try {
    key = createPrivateKey(pem)
  } catch {
    throw new Error('JWT_PRIVATE_KEY must contain a valid unencrypted PEM private key')
  }

  if (key.asymmetricKeyType !== 'rsa' || (key.asymmetricKeyDetails?.modulusLength ?? 0) < 2048) {
    throw new Error('JWT_PRIVATE_KEY must be an RSA key of at least 2048 bits')
  }

  return {
    privateKey: key.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicKey: createPublicKey(key).export({ type: 'spki', format: 'pem' }).toString()
  }
}