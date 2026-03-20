/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import * as web3utils from '../../lib/web3utils'

const expect = chai.expect

describe('web3utils', () => {
  describe('getAlchemyProvider', () => {
    afterEach(() => {
      web3utils.destroyProvider()
      sinon.restore()
    })

    it('handles missing ALCHEMY_API_KEY without crashing', () => {
      const originalKey = process.env.ALCHEMY_API_KEY
      delete process.env.ALCHEMY_API_KEY
      try {
        const provider = web3utils.getAlchemyProvider()
        if (provider !== null) {
          expect(provider).to.have.property('websocket')
        }
      } finally {
        if (originalKey !== undefined) {
          process.env.ALCHEMY_API_KEY = originalKey
        }
      }
    })

    it('returns the same provider instance on consecutive calls', function () {
      const first = web3utils.getAlchemyProvider()
      if (first === null) {
        this.skip()
        return
      }
      const second = web3utils.getAlchemyProvider()
      expect(second).to.equal(first)
    })
  })
})
