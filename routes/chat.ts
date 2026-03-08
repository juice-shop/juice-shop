/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import config from 'config'
import OpenAI from 'openai'
import { type ChatCompletionMessageParam, type ChatCompletionTool } from 'openai/resources'
import { Op } from 'sequelize'
import { ProductModel } from '../models/product'

const botName = config.get<string>('application.chatBot.name')
const appName = config.get<string>('application.name')

const SYSTEM_PROMPT = `You are "${botName}", the friendly customer service chatbot of the ${appName} online store.
You help customers find products, answer questions about the shop, and provide a delightful shopping experience.
Keep your responses concise and helpful.

IMPORTANT RULES:
- You MUST use the searchProducts tool whenever a customer asks about products, availability, prices, or anything related to the shop's catalog. NEVER guess or make up product names, prices, or descriptions.
- Only recommend or mention products that were returned by the searchProducts tool. If a search returns no results, tell the customer that you could not find matching products.
- Do NOT invent information. If you do not know the answer to a question, say so honestly.
- Your scope is limited to the ${appName} store. Do not answer questions unrelated to the shop or its products.
- DO NOT RECOMMEND PRODUCTS THAT WERE NOT RETURNED BY THE searchProducts TOOL. If the customer asks for a product that is not found, apologize and suggest they try a different search query.
- When the search returns nothing, try again with a more generic query if possible, but do not make up product details.`

const SEARCH_PRODUCTS_TOOL: ChatCompletionTool = {
  type: 'function',
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

async function searchProducts (query: string): Promise<string> {
  const products = await ProductModel.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ]
    },
    attributes: ['id', 'name', 'description', 'price', 'image']
  })
  return JSON.stringify(products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image
  })))
}

function createOpenAIClient (): OpenAI {
  return new OpenAI({
    baseURL: config.get<string>('application.chatBot.llmApiUrl'),
    apiKey: process.env.LLM_API_KEY ?? 'dummy-key'
  })
}

async function streamToClient (
  client: OpenAI,
  messages: ChatCompletionMessageParam[],
  model: string,
  res: Response
): Promise<void> {
  const maxToolRounds = 10
  let currentMessages = messages

  for (let round = 0; round <= maxToolRounds; round++) {
    const stream = await client.chat.completions.create({
      model,
      messages: currentMessages,
      tools: [SEARCH_PRODUCTS_TOOL],
      stream: true
    })

    const toolCalls = new Map<number, { id: string, name: string, args: string }>()
    let foundToolCall = false

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta
      const finishReason = chunk.choices?.[0]?.finish_reason

      if (delta?.tool_calls) {
        foundToolCall = true
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0
          if (!toolCalls.has(idx)) {
            toolCalls.set(idx, { id: '', name: '', args: '' })
          }
          const entry = toolCalls.get(idx)
          if (entry == null) continue
          if (tc.id) entry.id = tc.id
          if (tc.function?.name) entry.name = tc.function.name
          if (tc.function?.arguments) entry.args += tc.function.arguments
        }
      } else if (delta?.content) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
      }

      if (finishReason === 'stop') {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
      }
    }

    const validToolCalls = [...toolCalls.values()].filter(tc => tc.name === 'searchProducts')
    if (!foundToolCall || validToolCalls.length === 0 || round === maxToolRounds) {
      break
    }

    const assistantToolCalls = validToolCalls.map(tc => ({
      id: tc.id,
      type: 'function' as const,
      function: { name: tc.name, arguments: tc.args }
    }))

    res.write(`data: ${JSON.stringify({ choices: [{ delta: { tool_calls: assistantToolCalls } }] })}\n\n`)

    const toolResults: ChatCompletionMessageParam[] = []
    for (const tc of validToolCalls) {
      const args = JSON.parse(tc.args)
      const toolResult = await searchProducts(args.query ?? '')
      toolResults.push({
        role: 'tool' as const,
        content: toolResult,
        tool_call_id: tc.id
      })
    }

    currentMessages = [
      ...currentMessages,
      {
        role: 'assistant' as const,
        content: null,
        tool_calls: assistantToolCalls
      },
      ...toolResults
    ]
  }
}

export function chat () {
  return async (req: Request, res: Response) => {
    const model = config.get<string>('application.chatBot.model')
    const messages: ChatCompletionMessageParam[] = req.body?.messages ?? []

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Content-Encoding', 'identity')
    res.flushHeaders()

    const fullMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ]

    try {
      const client = createOpenAIClient()
      await streamToClient(client, fullMessages, model, res)
      res.write('data: [DONE]\n\n')
      res.end()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.write(`data: ${JSON.stringify({ error: `Failed to connect to LLM API: ${message}` })}\n\n`)
      res.write('data: [DONE]\n\n')
      res.end()
    }
  }
}
