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

const skipReason = process.env.ALCHEMY_API_KEY ? undefined : 'ALCHEMY_API_KEY not set'

void describe('Web3 NFT Minting', () => {
  before(async () => {
    const result = await createTestApp()
    app = result.app
  }, { timeout: 60000 })

  void describe('/rest/web3/nftMintListen', { skip: skipReason }, () => {
    void it('GET call confirms registration of event listener', async () => {
      const res = await request(app)
        .get('/rest/web3/nftMintListen')

      assert.equal(res.status, 200)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.success, true)
      assert.equal(res.body.message, 'Event Listener Created')
    })
  })

  void describe('/rest/web3/walletNFTVerify', () => {
    void it('POST missing wallet address fails to solve minting challenge', async () => {
      const res = await request(app)
        .post('/rest/web3/walletNFTVerify')
        .send({})

      assert.equal(res.status, 200)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.success, false)
      assert.equal(res.body.message, 'Wallet did not mint the NFT')
    })

    void it('POST invalid wallet address fails to solve minting challenge', async () => {
      const res = await request(app)
        .post('/rest/web3/walletNFTVerify')
        .send({ walletAddress: 'lalalalala' })

      assert.equal(res.status, 200)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.success, false)
      assert.equal(res.body.message, 'Wallet did not mint the NFT')
    })
  })
})
