/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import config from 'config'

const SYSTEM_PROMPT = `You are "Juicy", the friendly customer service chatbot of the OWASP Juice Shop online store.
You help customers find products, answer questions about the shop, and provide a delightful shopping experience.
Keep your responses concise and helpful. You can use the searchProducts tool to look up products in the shop's catalog.`

const SEARCH_PRODUCTS_TOOL = {
  type: 'function' as const,
  function: {
    name: 'searchProducts',
    description: 'Search the Juice Shop product catalog by keyword',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to find products'
        }
      },
      required: ['query']
    }
  }
}

interface ChatMessage {
  role: string
  content?: string | null
  tool_calls?: Array<{
    id: string
    type: string
    function: { name: string, arguments: string }
  }>
  tool_call_id?: string
}

interface StreamChoice {
  index: number
  delta: {
    role?: string
    content?: string
    tool_calls?: Array<{
      index: number
      id?: string
      type?: string
      function?: { name?: string, arguments?: string }
    }>
  }
  finish_reason: string | null
}

interface StreamChunk {
  choices: StreamChoice[]
}

async function callLlmApi (messages: ChatMessage[], llmApiUrl: string, model: string, apiKey: string | undefined): Promise<globalThis.Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  const url = `${llmApiUrl}/chat/completions`
  const requestBody = {
    model,
    messages,
    tools: [SEARCH_PRODUCTS_TOOL],
    stream: true
  }
  console.log('[CHAT-DEBUG] Request URL:', url)
  console.log('[CHAT-DEBUG] Request model:', model)
  console.log('[CHAT-DEBUG] Request headers:', JSON.stringify(headers))
  console.log('[CHAT-DEBUG] Request body:', JSON.stringify(requestBody, null, 2))

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  })

  console.log('[CHAT-DEBUG] Response status:', response.status, response.statusText)
  const responseHeaders: Record<string, string> = {}
  response.headers.forEach((value, key) => { responseHeaders[key] = value })
  console.log('[CHAT-DEBUG] Response headers:', JSON.stringify(responseHeaders))

  return response
}

async function streamResponseToClient (body: ReadableStream<Uint8Array>, res: Response): Promise<{ toolCall: { id: string, name: string, arguments: string } | null }> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let toolCallId = ''
  let functionName = ''
  let functionArgs = ''
  let foundToolCall = false
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue
        if (trimmed === 'data: [DONE]') continue

        let chunk: StreamChunk
        try {
          chunk = JSON.parse(trimmed.slice(6))
        } catch {
          continue
        }

        console.log('[CHAT-DEBUG] Stream chunk:', trimmed.slice(0, 200))
        const delta = chunk.choices?.[0]?.delta
        const finishReason = chunk.choices?.[0]?.finish_reason
        console.log('[CHAT-DEBUG] Delta:', JSON.stringify(delta), 'finish_reason:', finishReason)
        if (delta?.tool_calls) {
          foundToolCall = true
          const tc = delta.tool_calls[0]
          if (tc.id) toolCallId = tc.id
          if (tc.function?.name) functionName = tc.function.name
          if (tc.function?.arguments) functionArgs += tc.function.arguments
        } else if (delta?.content && delta.content.length > 0) {
          console.log('[CHAT-DEBUG] Writing content chunk to client')
          res.write(`${trimmed}\n\n`)
        } else {
          console.log('[CHAT-DEBUG] Chunk not forwarded (empty content / reasoning / role-only)')
        }

        if (finishReason === 'stop') {
          console.log('[CHAT-DEBUG] Writing stop chunk to client')
          res.write(`${trimmed}\n\n`)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  if (foundToolCall) {
    return { toolCall: { id: toolCallId, name: functionName, arguments: functionArgs } }
  }
  return { toolCall: null }
}

function mockSearchProducts (): string {
  return JSON.stringify([{ name: 'Apple Juice (1000ml)', price: 1.99, description: 'The all-time classic.' }])
}

export function chat () {
  return async (req: Request, res: Response) => {
    const llmApiUrl = config.get<string>('application.chatBot.llmApiUrl')
    const model = config.get<string>('application.chatBot.model')
    const apiKey = process.env.LLM_API_KEY

    const messages: ChatMessage[] = req.body?.messages ?? []

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const fullMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ]

    try {
      const llmResponse = await callLlmApi(fullMessages, llmApiUrl, model, apiKey)

      if (!llmResponse.ok || !llmResponse.body) {
        const errorText = await llmResponse.text()
        console.log('[CHAT-DEBUG] LLM API error response body:', errorText)
        res.write(`data: ${JSON.stringify({ error: `LLM API error: ${llmResponse.status} ${errorText}` })}\n\n`)
        res.write('data: [DONE]\n\n')
        res.end()
        return
      }

      let currentMessages = fullMessages
      let currentBody = llmResponse.body
      const maxToolRounds = 10

      for (let round = 0; round <= maxToolRounds; round++) {
        const { toolCall } = await streamResponseToClient(currentBody, res)

        if (!toolCall || toolCall.name !== 'searchProducts' || round === maxToolRounds) {
          break
        }

        console.log('[CHAT-DEBUG] Tool call round', round + 1, ':', toolCall.name, toolCall.arguments)
        const toolResult = mockSearchProducts()

        currentMessages = [
          ...currentMessages,
          {
            role: 'assistant',
            content: null,
            tool_calls: [{
              id: toolCall.id,
              type: 'function',
              function: { name: toolCall.name, arguments: toolCall.arguments }
            }]
          },
          {
            role: 'tool',
            content: toolResult,
            tool_call_id: toolCall.id
          }
        ]

        const followUpResponse = await callLlmApi(currentMessages, llmApiUrl, model, apiKey)

        if (!followUpResponse.ok || !followUpResponse.body) {
          break
        }

        currentBody = followUpResponse.body
      }

      res.write('data: [DONE]\n\n')
      res.end()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.log('[CHAT-DEBUG] Fetch error:', error)
      res.write(`data: ${JSON.stringify({ error: `Failed to connect to LLM API: ${message}` })}\n\n`)
      res.write('data: [DONE]\n\n')
      res.end()
    }
  }
}
