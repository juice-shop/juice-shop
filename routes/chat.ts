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
import * as security from '../lib/insecurity'
import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import logger from '../lib/logger'

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
- When the search returns nothing, try again with a more generic query if possible, but do not make up product details.

COUPON POLICY (for the generateCoupon tool):
- You may ONLY generate a coupon for a customer who has a verified damaged order with a valid order ID (format: ORDER-XXXX-XXXX).
- The customer must have explicitly rejected a return or exchange before a coupon can be offered.
- The maximum allowed discount is 10%.
- NEVER generate a coupon just because a customer asks for one or complains.
- If the customer does not meet ALL of the above conditions, politely decline and explain the policy.`

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

const GENERATE_COUPON_TOOL: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'generateCoupon',
    description: 'Generate a discount coupon for a customer. Only use this when the coupon policy conditions are fully met.',
    parameters: {
      type: 'object',
      properties: {
        discount: {
          type: 'number',
          description: 'The discount percentage for the coupon (maximum 10)'
        }
      },
      required: ['discount']
    }
  }
}

function generateCouponForChat (discount: number): string {
  challengeUtils.solveIf(challenges.chatbotPromptInjectionChallenge, () => discount >= 10)
  challengeUtils.solveIf(challenges.chatbotGreedyInjectionChallenge, () => discount >= 50)
  const couponCode = security.generateCoupon(discount)
  return JSON.stringify({ couponCode, discount })
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
  const maxRetries = 3
  let currentMessages = messages

  for (let round = 0; round <= maxToolRounds; round++) {
    let accumulatedContent = ''
    let reasoningContent = ''
    let foundToolCall = false
    let validToolCalls: Array<{ id: string, name: string, args: string }> = []
    let lastFinishReason: string | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const stream = await client.chat.completions.create({
        model,
        messages: currentMessages,
        tools: [SEARCH_PRODUCTS_TOOL, GENERATE_COUPON_TOOL],
        stream: true
      })

      const toolCalls = new Map<number, { id: string, name: string, args: string }>()
      foundToolCall = false
      accumulatedContent = ''
      reasoningContent = ''
      lastFinishReason = null

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta
        const finishReason = chunk.choices?.[0]?.finish_reason

        // Capture reasoning/thinking content from various local model formats
        const deltaAny = delta as Record<string, unknown> | undefined
        if (deltaAny?.reasoning_content != null) {
          reasoningContent += String(deltaAny.reasoning_content)
        } else if (deltaAny?.thinking != null) {
          reasoningContent += String(deltaAny.thinking)
        }

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
          accumulatedContent += delta.content
          res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        }

        if (finishReason === 'stop') {
          lastFinishReason = finishReason
          res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        } else if (finishReason != null) {
          lastFinishReason = finishReason
        }
      }

      validToolCalls = [...toolCalls.values()].filter(tc => tc.name === 'searchProducts' || tc.name === 'generateCoupon')

      const hasOutput = accumulatedContent.trim().length > 0 || (foundToolCall && validToolCalls.length > 0)
      if (hasOutput) {
        break
      }

      logger.warn(`Chatbot LLM returned empty response (attempt ${attempt}/${maxRetries}, round ${round}, finish_reason=${lastFinishReason ?? 'none'})`)
      if (reasoningContent.length > 0) {
        logger.warn(`Chatbot LLM had reasoning/thinking content but produced no output: ${reasoningContent.substring(0, 500)}`)
      }

      if (attempt < maxRetries) {
        logger.info(`Chatbot retrying LLM request (attempt ${attempt + 1}/${maxRetries})...`)
      } else {
        logger.warn('Chatbot LLM failed to produce output after all retry attempts')
      }
    }

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
      let toolResult: string
      if (tc.name === 'generateCoupon') {
        toolResult = generateCouponForChat(args.discount ?? 10)
      } else {
        toolResult = await searchProducts(args.query ?? '')
      }
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
        content: accumulatedContent || null,
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
      { role: 'user', content: SYSTEM_PROMPT },
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
