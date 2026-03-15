/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import { EventEmitter } from 'events'
import proxyquire from 'proxyquire'
import { type Request, type Response } from 'express'

const expect = chai.expect

describe('nftMint', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let statusStub: sinon.SinonStub
  let jsonStub: sinon.SinonStub
  let mockWebSocket: EventEmitter
  let mockProvider: any
  let mockContract: any
  let nftMintRoute: any

  beforeEach(() => {
    jsonStub = sinon.stub()
    statusStub = sinon.stub().returns({ json: jsonStub })

    req = { body: { walletAddress: '0xabc123' } }
    res = { status: statusStub, json: jsonStub }

    mockWebSocket = new EventEmitter()
    mockProvider = {
      websocket: mockWebSocket,
      destroy: sinon.stub().resolves()
    }
    mockContract = {
      on: sinon.stub()
    }

    nftMintRoute = proxyquire('../../routes/nftMint', {
      ethers: {
        WebSocketProvider: sinon.stub().returns(mockProvider),
        Contract: sinon.stub().returns(mockContract)
      }
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('nftMintListener', () => {
    it('returns 200 when provider connects successfully', async () => {
      await nftMintRoute.nftMintListener()(req as Request, res as Response)

      expect(statusStub.calledWith(200)).to.equal(true)
      expect(jsonStub.calledWithMatch({ success: true })).to.equal(true)
    })

    it('returns 503 when WebSocketProvider throws on construction', async () => {
      nftMintRoute = proxyquire('../../routes/nftMint', {
        ethers: {
          WebSocketProvider: sinon.stub().throws(new Error('connect ECONNREFUSED')),
          Contract: sinon.stub().returns(mockContract)
        }
      })

      await nftMintRoute.nftMintListener()(req as Request, res as Response)

      expect(statusStub.calledWith(503)).to.equal(true)
    })

    it('server does not crash when websocket emits an error event', async () => {
      await nftMintRoute.nftMintListener()(req as Request, res as Response)

      try {
        mockWebSocket.emit('error', new Error('Unexpected server response: 429'))
      } catch (error) {
        chai.assert.fail('WebSocket error event should not propagate as uncaught exception')
      }
    })
  })

  describe('walletNFTVerify', () => {
    it('returns success false when wallet has not minted NFT', () => {
      req = { body: { walletAddress: '0xunknown' } }
      nftMintRoute.walletNFTVerify()(req as Request, res as Response)

      expect(jsonStub.calledWithMatch({ success: false })).to.equal(true)
    })
  })
})