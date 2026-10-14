/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before, after, beforeEach, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import net from 'node:net'
import semver from 'semver'
import { engines as supportedEngines } from './../../package.json'
import { checkIfRunningOnSupportedNodeVersion, checkIfPortIsAvailable, checkIfEnvironmentVariableExists, isOllamaUrl, checkIfLlmModelAvailable, checkIfDomainReachable } from '../../lib/startup/validatePreconditions'

void describe('preconditionValidation', () => {
  void describe('checkIfRunningOnSupportedNodeVersion', () => {
    void it('should define the supported semver range as 22 - 26', () => {
      assert.equal(supportedEngines.node, '22 - 26')
      assert.notEqual(semver.validRange(supportedEngines.node), null)
    })

    void it('should accept a supported version', () => {
      assert.equal(checkIfRunningOnSupportedNodeVersion('26.42.1'), true)
      assert.equal(checkIfRunningOnSupportedNodeVersion('25.8.1'), true)
      assert.equal(checkIfRunningOnSupportedNodeVersion('24.2.0'), true)
      assert.equal(checkIfRunningOnSupportedNodeVersion('23.11.1'), true)
      assert.equal(checkIfRunningOnSupportedNodeVersion('22.16.0'), true)
    })

    void it('should fail for an unsupported version', () => {
      assert.equal(checkIfRunningOnSupportedNodeVersion('21.7.3'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('20.19.2'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('19.9.0'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('18.20.4'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('17.3.0'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('16.10.0'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('15.9.0'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('14.0.0'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('13.13.0'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('12.16.2'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('11.14.0'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('10.20.0'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('9.11.2'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('8.12.0'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('7.10.1'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('6.14.4'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('4.9.1'), false)
      assert.equal(checkIfRunningOnSupportedNodeVersion('0.12.8'), false)
    })
  })

  void describe('checkIfPortIsAvailable', () => {
    void it('should resolve when port 3000 is closed', async () => {
      const success = await checkIfPortIsAvailable(3000)
      assert.equal(success, true)
    })

    void describe('open a server before running the test', () => {
      const testServer = net.createServer()
      before(async () => {
        await new Promise<void>((resolve) => { testServer.listen(3000, resolve) })
      })

      void it('should reject when port 3000 is open', async () => {
        const success = await checkIfPortIsAvailable(3000)
        assert.equal(success, false)
      })

      after(async () => {
        await new Promise<void>((resolve) => { testServer.close(() => { resolve() }) })
      })
    })
  })

  void describe('checkIfEnvironmentVariableExists', () => {
    const originalEnv = process.env.ALCHEMY_API_KEY
    after(() => {
      process.env.ALCHEMY_API_KEY = originalEnv
    })

    void it('should return true if environment variable is present', () => {
      process.env.ALCHEMY_API_KEY = 'test-key'
      assert.equal(checkIfEnvironmentVariableExists('ALCHEMY_API_KEY'), true)
    })

    void it('should return false if environment variable is not present', () => {
      delete process.env.ALCHEMY_API_KEY
      assert.equal(checkIfEnvironmentVariableExists('ALCHEMY_API_KEY'), false)
    })

    void it('should return false if a non-existing environment variable is checked', () => {
      assert.equal(checkIfEnvironmentVariableExists('NON_EXISTING_VAR'), false)
    })
  })

  void describe('isOllamaUrl', () => {
    void it('should detect URL with Ollama default port 11434', () => {
      assert.equal(isOllamaUrl('http://localhost:11434/v1'), true)
      assert.equal(isOllamaUrl('http://127.0.0.1:11434/v1'), true)
      assert.equal(isOllamaUrl('https://myserver.example.com:11434/v1'), true)
    })

    void it('should detect URL with ollama hostname', () => {
      assert.equal(isOllamaUrl('http://ollama:11434/v1'), true)
      assert.equal(isOllamaUrl('http://ollama/v1'), true)
    })

    void it('should detect URL with /ollama path prefix', () => {
      assert.equal(isOllamaUrl('http://myserver.example.com/ollama/v1'), true)
    })

    void it('should not flag non-Ollama URLs', () => {
      assert.equal(isOllamaUrl('http://localhost:8080/v1'), false)
      assert.equal(isOllamaUrl('https://api.openai.com/v1'), false)
    })

    void it('should handle invalid URLs gracefully', () => {
      assert.equal(isOllamaUrl('not-a-url'), false)
      assert.equal(isOllamaUrl(''), false)
    })
  })

  void describe('checkIfOllamaModelAvailable', () => {
    let fetchStub: any

    beforeEach(() => {
      fetchStub = mock.method(global, 'fetch')
    })

    afterEach(() => {
      fetchStub.mock.restore()
    })

    void it('should succeed when model is listed in Ollama response', async () => {
      fetchStub.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ data: [{ id: 'qwen3.5:9b' }, { id: 'llama3:8b' }] }) }))
      await checkIfLlmModelAvailable('http://localhost:11434/v1')
      assert.equal(fetchStub.mock.calls.length, 1)
    })

    void it('should warn when configured model tag does not match pulled model tag', async () => {
      fetchStub.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ data: [{ id: 'qwen3.5:9b-q4' }] }) }))
      await checkIfLlmModelAvailable('http://localhost:11434/v1')
      assert.equal(fetchStub.mock.calls.length, 1)
    })

    void it('should warn when model is not in the available list', async () => {
      fetchStub.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ data: [{ id: 'llama3:8b' }, { id: 'mistral:7b' }] }) }))
      await checkIfLlmModelAvailable('http://localhost:11434/v1')
      assert.equal(fetchStub.mock.calls.length, 1)
    })

    void it('should handle empty model list', async () => {
      fetchStub.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ data: [] }) }))
      await checkIfLlmModelAvailable('http://localhost:11434/v1')
      assert.equal(fetchStub.mock.calls.length, 1)
    })

    void it('should handle non-ok response gracefully', async () => {
      fetchStub.mock.mockImplementation(async () => ({ ok: false, status: 500 }))
      await checkIfLlmModelAvailable('http://localhost:11434/v1')
      assert.equal(fetchStub.mock.calls.length, 1)
    })

    void it('should handle fetch error gracefully', async () => {
      fetchStub.mock.mockImplementation(async () => { throw new Error('Connection refused') })
      await checkIfLlmModelAvailable('http://localhost:11434/v1')
      assert.equal(fetchStub.mock.calls.length, 1)
    })
  })

  void describe('checkIfDomainReachable', () => {
    let fetchStub: any

    beforeEach(() => {
      fetchStub = mock.method(global, 'fetch')
    })

    afterEach(() => {
      fetchStub.mock.restore()
    })

    void it('should return true if domain is reachable', async () => {
      fetchStub.mock.mockImplementation(async () => ({ ok: true }))
      const success = await checkIfDomainReachable('https://www.alchemy.com/')
      assert.equal(success, true)
      assert.equal(fetchStub.mock.calls.length, 1)
    })

    void it('should return false and log warnings if domain is not reachable', async () => {
      fetchStub.mock.mockImplementation(async () => { throw new Error('Network error') })
      const success = await checkIfDomainReachable('https://www.alchemy.com/')
      assert.equal(success, false)
      assert.equal(fetchStub.mock.calls.length, 1)
    })
  })
})
