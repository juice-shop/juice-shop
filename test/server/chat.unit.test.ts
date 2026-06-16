/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import * as chat from '../../routes/chat'
import { UserModel } from '../../models/user'
import * as security from '../../lib/insecurity'

void describe('chat', () => {
  void describe('summarizeLlmError', () => {
    void it('should handle non-Error objects', () => {
      assert.equal(chat.summarizeLlmError('Simple error string'), 'Simple error string')
      assert.equal(chat.summarizeLlmError('Multi-line\nerror'), 'Multi-line')
    })

    void it('should return reachable message for connection errors', () => {
      assert.equal(chat.summarizeLlmError(new Error('Cannot connect to API')), 'LLM API is not reachable')
      assert.equal(chat.summarizeLlmError(new Error('ECONNREFUSED')), 'LLM API is not reachable')
    })

    void it('should return status code if available', () => {
      const error = new Error('Some error')
      ;(error as any).statusCode = 503
      assert.equal(chat.summarizeLlmError(error), 'LLM API returned status 503')
    })

    void it('should return first line of message otherwise', () => {
      assert.equal(chat.summarizeLlmError(new Error('First line\nSecond line')), 'First line')
      assert.equal(chat.summarizeLlmError(new Error('Trailing colon:')), 'Trailing colon')
    })
  })

  void describe('buildSystemPrompt', () => {
    void it('should include user name if provided', () => {
      const prompt = chat.buildSystemPrompt('John Doe')
      assert.ok(prompt.includes('The customer you are currently chatting with is John Doe.'))
    })

    void it('should not include user name if not provided', () => {
      const prompt = chat.buildSystemPrompt()
      assert.ok(!prompt.includes('The customer you are currently chatting with is'))
    })
  })

  void describe('getUserId', () => {
    void it('should return undefined if no token is present', async () => {
      const userId = await chat.getUserId({ headers: {} } as any)
      assert.equal(userId, undefined)
    })

    void it('should return user ID from decoded token', async () => {
      const token = security.authorize({ data: { id: 42 } })
      const req = { headers: { authorization: `Bearer ${token}` } }
      const userId = await chat.getUserId(req as any)
      assert.equal(userId, 42)
    })
  })

  void describe('getUserNameFromToken', () => {
    void it('should return undefined if no user ID is found', async () => {
      const userName = await chat.getUserNameFromToken({ headers: {} } as any)
      assert.equal(userName, undefined)
    })

    void it('should return username from database', async () => {
      const token = security.authorize({ data: { id: 42 } })
      const req = { headers: { authorization: `Bearer ${token}` } }
      mock.method(UserModel, 'findByPk', async () => ({ username: 'jdoe' }))
      const userName = await chat.getUserNameFromToken(req as any)
      assert.equal(userName, 'jdoe')
    })
  })
})
