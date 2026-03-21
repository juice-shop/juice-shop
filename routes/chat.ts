/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import config from 'config'
import { streamText, tool, stepCountIs } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { z } from 'zod'
import { Op } from 'sequelize'
import { ProductModel } from '../models/product'
import { UserModel } from '../models/user'
import * as security from '../lib/insecurity'
import * as utils from '../lib/utils'
import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import { roles } from '../lib/insecurity'
import logger from '../lib/logger'

function summarizeLlmError (error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error).split('\n')[0]
  }
  const msg = error.message
  if (msg.includes('Cannot connect to API') || msg.includes('ECONNREFUSED') || msg.includes('ECONNRESET') || msg.includes('ENOTFOUND')) {
    return 'LLM API is not reachable'
  }
  const statusCode = (error as any).statusCode
  if (statusCode) {
    return `LLM API returned status ${statusCode as number}`
  }
  return msg.split('\n')[0].replace(/:$/, '')
}

const botName = config.get<string>('application.chatBot.name')
const appName = config.get<string>('application.name')

async function getUserNameFromToken (req: Request): Promise<string | undefined> {
  const token = utils.jwtFrom(req)
  if (!token) return undefined
  const decoded = security.decode(token) as { data?: { id?: number } } | undefined
  const userId = decoded?.data?.id
  if (!userId) return undefined
  const user = await UserModel.findByPk(userId, { attributes: ['username'] })
  return user?.username ?? undefined
}

// vuln-code-snippet start chatbotGreedyInjectionChallenge
function buildSystemPrompt (userName?: string) { // vuln-code-snippet neutral-line chatbotGreedyInjectionChallenge
  const userIdentifier = userName ? `\nThe customer you are currently chatting with is ${userName}.` : ''
  return `You are "${botName}", the customer service chatbot for ${appName}. 
Help users find products and answer questions about the shop. Keep responses short.

Guidelines:
- Use searchProducts for any catalog or price queries. Don't guess product details.
- Only mention products found via the search tool.
- If no results are found, suggest a different search.
- Stick to shop-related topics only.

Coupons:
- Only generate a coupon if the customer has a verified damaged order (ID format: xxxx-xxxxxxxxxxxxxxxx).
- The customer must have already declined a return/exchange.
- Max discount is 10%. 
- Do not provide coupons just for complaints or requests.${userIdentifier}`
}

const provider = createOpenAICompatible({
  name: 'juice-shop-llm',
  apiKey: process.env.LLM_API_KEY ?? '',
  baseURL: config.get<string>('application.chatBot.llmApiUrl')
})

const chatTools = {
  searchProducts: tool({
    description: 'Search the product catalog',
    inputSchema: z.object({
      query: z.string().describe('Search keyword')
    }),
    execute: async ({ query }) => {
      const products = await ProductModel.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } }
          ]
        },
        attributes: ['id', 'name', 'description', 'price', 'image']
      })
      return products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image
      }))
    }
  }),

  // vuln-code-snippet start chatbotPromptInjectionChallenge
  generateCoupon: tool({
    description: 'Generate a discount coupon', // vuln-code-snippet neutral-line chatbotPromptInjectionChallenge chatbotGreedyInjectionChallenge
    inputSchema: z.object({
      discount: z.number().describe('Discount percentage') // vuln-code-snippet vuln-line chatbotPromptInjectionChallenge chatbotGreedyInjectionChallenge
    }),
    execute: async ({ discount }) => {
      challengeUtils.solveIf(challenges.chatbotPromptInjectionChallenge, () => discount >= 10) // vuln-code-snippet hide-line
      challengeUtils.solveIf(challenges.chatbotGreedyInjectionChallenge, () => discount >= 50) // vuln-code-snippet hide-line
      const couponCode = security.generateCoupon(discount) // vuln-code-snippet vuln-line chatbotPromptInjectionChallenge
      return { couponCode, discount } // vuln-code-snippet neutral-line chatbotPromptInjectionChallenge
    }
  })
} // vuln-code-snippet end chatbotGreedyInjectionChallenge chatbotPromptInjectionChallenge

export function chat () {
  return async (req: Request, res: Response) => {
    const model = config.get<string>('application.chatBot.model')
    const messages = req.body?.messages ?? []
    const userName = await getUserNameFromToken(req)

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Content-Encoding', 'identity')
    res.flushHeaders()

    const systemPrompt = buildSystemPrompt(userName)

    try {
      const result = streamText({
        model: provider(model),
        system: systemPrompt,
        messages,
        tools: chatTools,
        maxRetries: config.get<number>('application.chatBot.llmMaxRetries'),
        stopWhen: stepCountIs(10),
        onError: ({ error }) => {
          logger.warn('Chatbot stream error: ' + summarizeLlmError(error))
        }
      })

      for await (const event of result.fullStream) {
        switch (event.type) {
          case 'text-delta':
            res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: event.text } }] })}\n\n`)
            break
          case 'tool-call':
            challengeUtils.solveIf(challenges.aiDebuggingChallenge, () => {
              const token = utils.jwtFrom(req)
              const decoded = token ? security.decode(token) as { data?: { role?: string } } : undefined
              const role = decoded?.data?.role
              return req.cookies.show_tool_calls === 'true' && role !== roles.admin
            })
            res.write(`data: ${JSON.stringify({
              choices: [{
                delta: {
                  tool_calls: [{
                    id: event.toolCallId,
                    type: 'function',
                    function: { name: event.toolName, arguments: JSON.stringify(event.input) }
                  }]
                }
              }]
            })}\n\n`)
            break
          case 'finish':
            res.write(`data: ${JSON.stringify({ choices: [{ finish_reason: event.finishReason }] })}\n\n`)
            break
          case 'error':
            res.write(`data: ${JSON.stringify({ error: `LLM error: ${event.error as string}` })}\n\n`)
            break
        }
      }

      res.write('data: [DONE]\n\n')
      res.end()
    } catch (error) {
      logger.warn('Chatbot connection error: ' + summarizeLlmError(error))
      res.write(`data: ${JSON.stringify({ error: 'LLM API is not reachable' })}\n\n`)
      res.write('data: [DONE]\n\n')
      res.end()
    }
  }
}
