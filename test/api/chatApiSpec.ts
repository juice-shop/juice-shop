/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as frisby from 'frisby'
import { expect } from '@jest/globals'
import * as http from 'http'

const REST_URL = 'http://localhost:3000/rest'
const MOCK_LLM_PORT = 43210

const jsonHeader = { 'content-type': 'application/json' }

let mockServer: http.Server
let onLlmRequest: (req: http.IncomingMessage, body: string, res: http.ServerResponse) => void

function sseData (obj: object): string {
  return `data: ${JSON.stringify(obj)}\n\n`
}

function contentChunk (content: string): object {
  return {
    id: 'chatcmpl-test',
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'test-model',
    choices: [{ index: 0, delta: { content }, finish_reason: null }]
  }
}

function toolCallChunk (id: string, name: string, args: string): object {
  return {
    id: 'chatcmpl-test',
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'test-model',
    choices: [{
      index: 0,
      delta: {
        tool_calls: [{ index: 0, id, type: 'function', function: { name, arguments: args } }]
      },
      finish_reason: null
    }]
  }
}

function finishChunk (reason: string = 'stop'): object {
  return {
    id: 'chatcmpl-test',
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'test-model',
    choices: [{ index: 0, delta: {}, finish_reason: reason }]
  }
}

function sendSSE (res: http.ServerResponse, chunks: object[]): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  })
  for (const chunk of chunks) {
    res.write(sseData(chunk))
  }
  res.write('data: [DONE]\n\n')
  res.end()
}

beforeAll((done) => {
  ;(http.globalAgent as any).keepAlive = false
  mockServer = http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', () => {
      onLlmRequest(req, body, res)
    })
  })
  mockServer.listen(MOCK_LLM_PORT, done)
})

afterAll((done) => {
  mockServer.close(done)
})

describe('/rest/chat', () => {
  it('POST returns streamed text content as SSE events', () => {
    onLlmRequest = (_req, _body, res) => {
      sendSSE(res, [
        contentChunk('Hello'),
        contentChunk(' there!'),
        finishChunk()
      ])
    }

    return frisby.post(REST_URL + '/chat', {
      headers: jsonHeader,
      body: { messages: [{ role: 'user', content: 'Hi' }] }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /text\/event-stream/)
      .expect('bodyContains', 'Hello')
      .expect('bodyContains', ' there!')
      .expect('bodyContains', 'data: [DONE]')
  })

  it('POST sets correct SSE response headers', () => {
    onLlmRequest = (_req, _body, res) => {
      sendSSE(res, [contentChunk('Hi'), finishChunk()])
    }

    return frisby.post(REST_URL + '/chat', {
      headers: jsonHeader,
      body: { messages: [{ role: 'user', content: 'Hello' }] }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /text\/event-stream/)
      .expect('header', 'cache-control', /no-cache/)
  })

  it('POST includes system prompt and user messages in LLM request', () => {
    onLlmRequest = (_req, body, res) => {
      const parsed = JSON.parse(body)
      expect(parsed.messages[0].role).toBe('system')
      expect(parsed.messages[0].content).toContain('Juicy')
      expect(parsed.messages[1].role).toBe('user')
      expect(parsed.messages[1].content).toBe('What is your name?')
      sendSSE(res, [contentChunk('I am Juicy!'), finishChunk()])
    }

    return frisby.post(REST_URL + '/chat', {
      headers: jsonHeader,
      body: { messages: [{ role: 'user', content: 'What is your name?' }] }
    })
      .expect('status', 200)
  })

  it('POST sends searchProducts tool definition to LLM', () => {
    onLlmRequest = (_req, body, res) => {
      const parsed = JSON.parse(body)
      expect(parsed.tools).toBeDefined()
      expect(parsed.tools.length).toBe(2)
      expect(parsed.tools.map((t: { function: { name: string } }) => t.function.name)).toContain('searchProducts')
      expect(parsed.tools.map((t: { function: { name: string } }) => t.function.name)).toContain('generateCoupon')
      sendSSE(res, [contentChunk('We have many products!'), finishChunk()])
    }

    return frisby.post(REST_URL + '/chat', {
      headers: jsonHeader,
      body: { messages: [{ role: 'user', content: 'What products do you have?' }] }
    })
      .expect('status', 200)
  })

  it('POST handles searchProducts tool call and returns follow-up response', () => {
    let callCount = 0
    onLlmRequest = (_req, body, res) => {
      callCount++
      if (callCount === 1) {
        sendSSE(res, [
          toolCallChunk('call_abc', 'searchProducts', '{"query":"apple"}'),
          finishChunk('tool_calls')
        ])
      } else {
        const parsed = JSON.parse(body)
        const toolMsg = parsed.messages.find((m: { role: string }) => m.role === 'tool')
        expect(toolMsg).toBeDefined()
        expect(toolMsg.tool_call_id).toBe('call_abc')
        expect(toolMsg.content).toContain('Apple Juice')
        sendSSE(res, [
          contentChunk('We have Apple Juice (1000ml) for $1.99!'),
          finishChunk()
        ])
      }
    }

    return frisby.post(REST_URL + '/chat', {
      headers: jsonHeader,
      body: { messages: [{ role: 'user', content: 'Do you have apple juice?' }] }
    })
      .expect('status', 200)
      .expect('bodyContains', 'Apple Juice')
      .expect('bodyContains', 'data: [DONE]')
  })

  it('POST handles LLM API error gracefully', () => {
    onLlmRequest = (_req, _body, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: { message: 'Internal server error' } }))
    }

    return frisby.post(REST_URL + '/chat', {
      headers: jsonHeader,
      body: { messages: [{ role: 'user', content: 'Hi' }] }
    })
      .expect('status', 200)
      .expect('bodyContains', 'error')
      .expect('bodyContains', 'data: [DONE]')
  })

  it('POST with empty messages returns error SSE stream', () => {
    onLlmRequest = (_req, _body, res) => {
      sendSSE(res, [
        contentChunk('How can I help you?'),
        finishChunk()
      ])
    }

    return frisby.post(REST_URL + '/chat', {
      headers: jsonHeader,
      body: { messages: [] }
    })
      .expect('status', 200)
      .expect('bodyContains', 'error')
      .expect('bodyContains', 'data: [DONE]')
  })

  it('POST response SSE data lines contain valid JSON', () => {
    onLlmRequest = (_req, _body, res) => {
      sendSSE(res, [
        contentChunk('Test message'),
        finishChunk()
      ])
    }

    return frisby.post(REST_URL + '/chat', {
      headers: jsonHeader,
      body: { messages: [{ role: 'user', content: 'Test' }] }
    })
      .expect('status', 200)
      .then((res) => {
        const body = res.body as unknown as string
        const dataLines = body.split('\n').filter((l: string) => l.startsWith('data: '))
        expect(dataLines.length).toBeGreaterThanOrEqual(2)
        for (const line of dataLines) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          const parsed = JSON.parse(data)
          expect(parsed.choices).toBeDefined()
          if (parsed.choices[0].finish_reason) continue
          expect(parsed.choices[0].delta).toBeDefined()
        }
      })
  })
})
