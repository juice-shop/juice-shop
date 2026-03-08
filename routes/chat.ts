/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'

export function chat () {
  return async (req: Request, res: Response) => {
    const messages: Array<{ role: string, content: string }> = req.body?.messages ?? []
    const userMessage = messages.filter(m => m.role === 'user').pop()?.content ?? ''

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const mockId = 'chatcmpl-mock-' + String(Date.now())
    const mockResponse = 'cowabunga'

    const sendChunk = (choices: object[]): void => {
      res.write(`data: ${JSON.stringify({ id: mockId, object: 'chat.completion.chunk', choices })}\n\n`)
    }

    sendChunk([{ index: 0, delta: { role: 'assistant' }, finish_reason: null }])

    for (const char of mockResponse) {
      sendChunk([{ index: 0, delta: { content: char }, finish_reason: null }])
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    sendChunk([{
      index: 0,
      delta: {
        tool_calls: [{
          index: 0,
          id: 'call_mock_' + String(Date.now()),
          type: 'function',
          function: {
            name: 'searchProducts',
            arguments: JSON.stringify({ query: userMessage })
          }
        }]
      },
      finish_reason: null
    }])

    sendChunk([{ index: 0, delta: {}, finish_reason: 'stop' }])

    res.write('data: [DONE]\n\n')
    res.end()
  }
}
