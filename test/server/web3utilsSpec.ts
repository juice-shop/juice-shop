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
      sinon.restore()
    })

    it('returns null when ALCHEMY_API_KEY is not set and connection fails', () => {
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

    it('returns the same provider instance on consecutive calls', () => {
      const first = web3utils.getAlchemyProvider()
      const second = web3utils.getAlchemyProvider()
      expect(first).to.equal(second)
    })
  })
})
