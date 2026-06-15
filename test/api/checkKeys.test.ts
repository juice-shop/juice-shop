/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'

let app: Express

void describe('Web3 Key Derivation & NFT Unlock', () => {
  before(async () => {
    const result = await createTestApp()
    app = result.app
  }, { timeout: 60000 })

  void describe('/rest/web3/submitKey', () => {
    void it('POST missing key in request body gets rejected as non-Ethereum key', async () => {
      const res = await request(app)
        .post('/rest/web3/submitKey')
        .send({})

      assert.equal(res.status, 401)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.success, false)
      assert.equal(res.body.message, 'Looks like you entered a non-Ethereum private key to access me.')
    })

    void it('POST arbitrary string in request body gets rejected as non-Ethereum key', async () => {
      const res = await request(app)
        .post('/rest/web3/submitKey')
        .send({ privateKey: 'lalalala' })

      assert.equal(res.status, 401)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.success, false)
      assert.equal(res.body.message, 'Looks like you entered a non-Ethereum private key to access me.')
    })

    void it('POST public wallet key in request body gets rejected as such', async () => {
      const res = await request(app)
        .post('/rest/web3/submitKey')
        .send({ privateKey: '0x02c7a2a93289c9fbda5990bac6596993e9bb0a8d3f178175a80b7cfd983983f506' })

      assert.equal(res.status, 401)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.success, false)
      assert.equal(res.body.message, 'Looks like you entered the public key of my ethereum wallet!')
    })

    void it('POST wallet address in request body gets rejected as such', async () => {
      const res = await request(app)
        .post('/rest/web3/submitKey')
        .send({ privateKey: '0x8343d2eb2B13A2495De435a1b15e85b98115Ce05' })

      assert.equal(res.status, 401)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.success, false)
      assert.equal(res.body.message, 'Looks like you entered the public address of my ethereum wallet!')
    })

    void it('POST private key in request body gets accepted', async () => {
      const res = await request(app)
        .post('/rest/web3/submitKey')
        .send({ privateKey: '0x5bcc3e9d38baa06e7bfaab80ae5957bbe8ef059e640311d7d6d465e6bc948e3e' })

      assert.equal(res.status, 200)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.success, true)
      assert.equal(res.body.message, 'Challenge successfully solved')
    })
  })

  void describe('/rest/web3/nftUnlocked', () => {
    void it('GET solution status of "Unlock NFT" challenge', async () => {
      const res = await request(app)
        .get('/rest/web3/nftUnlocked')

      assert.equal(res.status, 200)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(typeof res.body.status, 'boolean')
    })
  })
})
