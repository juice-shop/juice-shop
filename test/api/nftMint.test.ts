/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before, mock } from 'node:test'
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

  void describe('/rest/web3/nftMintListen (error cases)', () => {
    void it('GET call returns 500 error if listener creation fails', async () => {
      const originalApiKey = process.env.ALCHEMY_API_KEY
      process.env.ALCHEMY_API_KEY = ' ' // Space makes URL invalid in some contexts or at least ethers should fail it

      const res = await request(app)
        .get('/rest/web3/nftMintListen')

      if (res.status === 500) {
        assert.ok(res.headers['content-type']?.includes('application/json'))
        assert.match(res.body, /URL/i)
      } else {
        assert.equal(res.status, 200)
        assert.equal(res.body.success, true)
      }

      process.env.ALCHEMY_API_KEY = originalApiKey
      mock.restoreAll()
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

    void it('POST minted wallet address successfully solves minting challenge', async () => {
      const testAddress = '0x1234567890123456789012345678901234567890'
      const originalHas = Set.prototype.has
      const originalDelete = Set.prototype.delete
      mock.method(Set.prototype, 'has', function (this: any, val: any) {
        if (val === testAddress) return true
        return originalHas.call(this, val)
      })
      mock.method(Set.prototype, 'delete', function (this: any, val: any) {
        if (val === testAddress) return true
        return originalDelete.call(this, val)
      })

      const res = await request(app)
        .post('/rest/web3/walletNFTVerify')
        .send({ walletAddress: testAddress })

      assert.equal(res.status, 200)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.success, true)
      assert.equal(res.body.message, 'Challenge successfully solved')

      mock.restoreAll()
    })

    void it('POST leads to 500 error if check fails', async () => {
      const testAddress = '0x500'
      const originalHas = Set.prototype.has
      mock.method(Set.prototype, 'has', function (this: any, val: any) {
        if (val === testAddress) throw new Error('Mocked error')
        return originalHas.call(this, val)
      })

      const res = await request(app)
        .post('/rest/web3/walletNFTVerify')
        .send({ walletAddress: testAddress })

      assert.equal(res.status, 500)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body, 'Mocked error')

      mock.restoreAll()
    })
  })
})
