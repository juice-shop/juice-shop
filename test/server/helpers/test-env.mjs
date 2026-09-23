import { generateKeyPairSync } from 'node:crypto'

process.env.NODE_ENV = 'test'

// Each test process uses a disposable key, never the application's secret.
process.env.JWT_PRIVATE_KEY = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' }
}).privateKey