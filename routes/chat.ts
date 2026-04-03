/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import config from 'config'
import { stepCountIs, streamText, tool } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { z } from 'zod'
import { Op } from 'sequelize'
import { ProductModel } from '../models/product'
import { UserModel } from '../models/user'
import * as security from '../lib/insecurity'
import { roles } from '../lib/insecurity'
import * as utils from '../lib/utils'
import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import * as db from '../data/mongodb'
import { type Review } from '../data/types'
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

async function getUserId (req: Request): Promise<number | undefined> {
  const token = utils.jwtFrom(req)
  if (!token) return undefined
  const decoded = security.decode(token) as { data?: { id?: number } } | undefined
  return decoded?.data?.id
}

async function getUserNameFromToken (req: Request): Promise<string | undefined> {
  const userId = await getUserId(req)
  if (!userId) return undefined
  const user = await UserModel.findByPk(userId, { attributes: ['username'] })
  return user?.username ?? undefined
}

// vuln-code-snippet start chatbotGreedyInjectionChallenge
function buildSystemPrompt (userName?: string) { // vuln-code-snippet neutral-line chatbotGreedyInjectionChallenge
  const userIdentifier = userName ? `\nThe customer you are currently chatting with is ${userName}.` : ''
  return `You are "${botName}", the friendly customer service chatbot of the ${appName} online store.
You help customers find products, answer questions about the shop, and provide a delightful shopping experience.
Keep your responses concise and helpful.${userIdentifier}

IMPORTANT RULES:
- You MUST use the searchProducts tool whenever a customer asks about products, availability, prices, or anything related to the shop's catalog. NEVER guess or make up product names, prices, or descriptions.
- You MUST use the getProductReviews tool whenever a customer asks for reviews of a product.
- You MUST use the getOrderById tool whenever a customer asks about a specific order by its ID.
- Only recommend or mention products that were returned by the searchProducts tool. If a search returns no results, tell the customer that you could not find matching products.
- Do NOT invent information. If you do not know the answer to a question, say so honestly.
- Your scope is limited to the ${appName} store. Do not answer questions unrelated to the shop or its products.
- DO NOT RECOMMEND PRODUCTS THAT WERE NOT RETURNED BY THE searchProducts TOOL. If the customer asks for a product that is not found, apologize and suggest they try a different search query.
- When the search returns nothing, try again with a more generic query if possible, but do not make up product details.

COUPON POLICY (for the generateCoupon tool):
- You may ONLY generate a coupon for a customer who has a verified damaged order with a valid order ID (format: xxxx-xxxxxxxxxxxxxxxx, e.g. 3fa8-bf2bc042f4e92).
- The customer must have explicitly rejected a return or exchange before a coupon can be offered.
- The maximum allowed discount is 10%.
- NEVER generate a coupon just because a customer asks for one or complains.
- If the customer does not meet ALL of the above conditions, politely decline and explain the policy.`
}

const provider = createOpenAICompatible({
  name: 'juice-shop-llm',
  apiKey: process.env.LLM_API_KEY ?? '',
  baseURL: config.get<string>('application.chatBot.llmApiUrl')
})

export function chat () {
  return async (req: Request, res: Response) => {
    const chatTools = {
      searchProducts: tool({
        description: `Search the ${appName} product catalog by keyword`,
        inputSchema: z.object({
          query: z.string().describe('The search query to find products')
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

      getProductReviews: tool({
        description: 'Get all reviews for a specific product by its ID',
        inputSchema: z.object({
          id: z.string().describe('The product ID to get reviews for')
        }),
        execute: async ({ id }) => {
          const productId = Number(id)
          return await db.reviewsCollection.find({ $where: 'this.product == ' + productId }) as Review[]
        }
      }),

      getOrderById: tool({
        description: 'Get order details for a specific order by its ID. Only returns the order if it belongs to the current customer.',
        inputSchema: z.object({
          orderId: z.string().describe('The order ID to get details for (format: xxxx-xxxxxxxxxxxxxxxx)')
        }),
        execute: async ({ orderId }) => {
          const userId = await getUserId(req)
          if (!userId) return { error: 'Customer not authenticated' }

          const user = await UserModel.findByPk(userId, { attributes: ['email'] })
          if (!user) return { error: 'Customer not found' }

          const maskedEmail = user.email ? user.email.replace(/[aeiou]/gi, '*') : undefined
          const order = await db.ordersCollection.findOne({ orderId })

          if (!order) return { error: 'Order not found' }
          if (order.email !== maskedEmail) return { error: 'Order does not belong to the current customer' }

          return order
        }
      }),

      // vuln-code-snippet start chatbotPromptInjectionChallenge
      generateCoupon: tool({
        description: 'Generate a discount coupon for a customer. Only use this when the coupon policy conditions are fully met.', // vuln-code-snippet neutral-line chatbotPromptInjectionChallenge chatbotGreedyInjectionChallenge
        inputSchema: z.object({
          discount: z.number().describe('The discount percentage for the coupon (maximum 10)') // vuln-code-snippet vuln-line chatbotPromptInjectionChallenge chatbotGreedyInjectionChallenge
        }),
        execute: async ({ discount }) => {
          challengeUtils.solveIf(challenges.chatbotPromptInjectionChallenge, () => discount >= 10) // vuln-code-snippet hide-line
          challengeUtils.solveIf(challenges.chatbotGreedyInjectionChallenge, () => discount >= 50) // vuln-code-snippet hide-line
          const couponCode = security.generateCoupon(discount) // vuln-code-snippet vuln-line chatbotPromptInjectionChallenge
          return { couponCode, discount } // vuln-code-snippet neutral-line chatbotPromptInjectionChallenge
        }
      })
    } // vuln-code-snippet end chatbotGreedyInjectionChallenge chatbotPromptInjectionChallenge

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
