/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import net from 'node:net'
import sinon from 'sinon'
import semver from 'semver'
import sinonChai from 'sinon-chai'
import { engines as supportedEngines } from './../../package.json'
import { checkIfRunningOnSupportedNodeVersion, checkIfPortIsAvailable, checkIfEnvironmentVariableExists, isOllamaUrl, checkIfOllamaModelAvailable, checkIfDomainReachable } from '../../lib/startup/validatePreconditions'

const expect = chai.expect
chai.use(sinonChai)

describe('preconditionValidation', () => {
  describe('checkIfRunningOnSupportedNodeVersion', () => {
    it('should define the supported semver range as 20 - 24', () => {
      expect(supportedEngines.node).to.equal('20 - 24')
      expect(semver.validRange(supportedEngines.node)).to.not.equal(null)
    })

    it('should accept a supported version', () => {
      expect(checkIfRunningOnSupportedNodeVersion('24.2.0')).to.equal(true)
      expect(checkIfRunningOnSupportedNodeVersion('23.11.1')).to.equal(true)
      expect(checkIfRunningOnSupportedNodeVersion('22.16.0')).to.equal(true)
      expect(checkIfRunningOnSupportedNodeVersion('21.7.3')).to.equal(true)
      expect(checkIfRunningOnSupportedNodeVersion('20.19.2')).to.equal(true)
    })

    it('should fail for an unsupported version', () => {
      expect(checkIfRunningOnSupportedNodeVersion('25.0.0')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('19.9.0')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('18.20.4')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('17.3.0')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('16.10.0')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('15.9.0')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('14.0.0')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('13.13.0')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('12.16.2')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('11.14.0')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('10.20.0')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('9.11.2')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('8.12.0')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('7.10.1')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('6.14.4')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('4.9.1')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('0.12.8')).to.equal(false)
    })
  })

  describe('checkIfPortIsAvailable', () => {
    it('should resolve when port 3000 is closed', async () => {
      const success = await checkIfPortIsAvailable(3000)
      expect(success).to.equal(true)
    })

    describe('open a server before running the test', () => {
      const testServer = net.createServer()
      before((done) => {
        testServer.listen(3000, done)
      })

      it('should reject when port 3000 is open', async () => {
        const success = await checkIfPortIsAvailable(3000)
        expect(success).to.equal(false)
      })

      after((done) => {
        testServer.close(done)
      })
    })
  })

  describe('checkIfEnvironmentVariableExists', () => {
    const originalEnv = process.env.ALCHEMY_API_KEY
    after(() => {
      process.env.ALCHEMY_API_KEY = originalEnv
    })

    it('should return true if environment variable is present', () => {
      process.env.ALCHEMY_API_KEY = 'test-key'
      expect(checkIfEnvironmentVariableExists('ALCHEMY_API_KEY')).to.equal(true)
    })

    it('should return true if environment variable is not present', () => {
      delete process.env.ALCHEMY_API_KEY
      expect(checkIfEnvironmentVariableExists('ALCHEMY_API_KEY')).to.equal(true)
    })

    it('should return true if a non-existing environment variable is checked', () => {
      expect(checkIfEnvironmentVariableExists('NON_EXISTING_VAR')).to.equal(true)
    })
  })

  describe('isOllamaUrl', () => {
    it('should detect URL with Ollama default port 11434', () => {
      expect(isOllamaUrl('http://localhost:11434/v1')).to.equal(true)
      expect(isOllamaUrl('http://127.0.0.1:11434/v1')).to.equal(true)
      expect(isOllamaUrl('https://myserver.example.com:11434/v1')).to.equal(true)
    })

    it('should detect URL with ollama hostname', () => {
      expect(isOllamaUrl('http://ollama:11434/v1')).to.equal(true)
      expect(isOllamaUrl('http://ollama/v1')).to.equal(true)
    })

    it('should detect URL with /ollama path prefix', () => {
      expect(isOllamaUrl('http://myserver.example.com/ollama/v1')).to.equal(true)
    })

    it('should not flag non-Ollama URLs', () => {
      expect(isOllamaUrl('http://localhost:8080/v1')).to.equal(false)
      expect(isOllamaUrl('https://api.openai.com/v1')).to.equal(false)
    })

    it('should handle invalid URLs gracefully', () => {
      expect(isOllamaUrl('not-a-url')).to.equal(false)
      expect(isOllamaUrl('')).to.equal(false)
    })
  })

  describe('checkIfOllamaModelAvailable', () => {
    let fetchStub: sinon.SinonStub

    beforeEach(() => {
      fetchStub = sinon.stub(global, 'fetch')
    })

    afterEach(() => {
      fetchStub.restore()
    })

    it('should succeed when model is listed in Ollama response', async () => {
      fetchStub.resolves({
        ok: true,
        json: async () => ({ data: [{ id: 'qwen3.5:9b' }, { id: 'llama3:8b' }] })
      })
      await checkIfOllamaModelAvailable('http://localhost:11434/v1')
      expect(fetchStub.calledOnce).to.equal(true)
    })

    it('should warn when configured model tag does not match pulled model tag', async () => {
      fetchStub.resolves({
        ok: true,
        json: async () => ({ data: [{ id: 'qwen3.5:9b-q4' }] })
      })
      await checkIfOllamaModelAvailable('http://localhost:11434/v1')
      expect(fetchStub.calledOnce).to.equal(true)
    })

    it('should warn when model is not in the available list', async () => {
      fetchStub.resolves({
        ok: true,
        json: async () => ({ data: [{ id: 'llama3:8b' }, { id: 'mistral:7b' }] })
      })
      await checkIfOllamaModelAvailable('http://localhost:11434/v1')
      expect(fetchStub.calledOnce).to.equal(true)
    })

    it('should handle empty model list', async () => {
      fetchStub.resolves({
        ok: true,
        json: async () => ({ data: [] })
      })
      await checkIfOllamaModelAvailable('http://localhost:11434/v1')
      expect(fetchStub.calledOnce).to.equal(true)
    })

    it('should handle non-ok response gracefully', async () => {
      fetchStub.resolves({ ok: false, status: 500 })
      await checkIfOllamaModelAvailable('http://localhost:11434/v1')
      expect(fetchStub.calledOnce).to.equal(true)
    })

    it('should handle fetch error gracefully', async () => {
      fetchStub.rejects(new Error('Connection refused'))
      await checkIfOllamaModelAvailable('http://localhost:11434/v1')
      expect(fetchStub.calledOnce).to.equal(true)
    })
  })

  describe('checkIfDomainReachable', () => {
    let fetchStub: sinon.SinonStub

    beforeEach(() => {
      fetchStub = sinon.stub(global, 'fetch')
    })

    afterEach(() => {
      fetchStub.restore()
    })

    it('should return true if domain is reachable', async () => {
      fetchStub.resolves({ ok: true })
      const success = await checkIfDomainReachable('https://www.alchemy.com/')
      expect(success).to.equal(true)
      expect(fetchStub.calledOnce).to.equal(true)
    })

    it('should return true and log warnings if domain is not reachable', async () => {
      fetchStub.rejects(new Error('Network error'))
      const success = await checkIfDomainReachable('https://www.alchemy.com/')
      expect(success).to.equal(true)
      expect(fetchStub.calledOnce).to.equal(true)
    })
  })
})
