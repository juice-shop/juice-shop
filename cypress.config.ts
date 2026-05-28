import { defineConfig } from 'cypress'
import * as security from './lib/insecurity'
import config from 'config'
import type { Memory as MemoryConfig, Product as ProductConfig } from './lib/config.types'
import * as utils from './lib/utils'
import { generateSync } from 'otplib'
import * as http from 'http'

let mockLlmServer: http.Server | null = null

function sseChunk (obj: object): string {
  return `data: ${JSON.stringify(obj)}\n\n`
}

function makeChunk (delta: object, finishReason: string | null = null): object {
  return {
    id: 'chatcmpl-test',
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'test-model',
    choices: [{ index: 0, delta, finish_reason: finishReason }]
  }
}

export default defineConfig({
  projectId: '3hrkhu',
  defaultCommandTimeout: 10000,
  retries: {
    runMode: 2
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'test/cypress/e2e/**.spec.ts',
    downloadsFolder: 'test/cypress/downloads',
    fixturesFolder: false,
    supportFile: 'test/cypress/support/e2e.ts',
    setupNodeEvents (on: any) {
      on('task', {
        GenerateCoupon (discount: number) {
          return security.generateCoupon(discount)
        },
        GetBlueprint () {
          for (const product of config.get<ProductConfig[]>('products')) {
            if (product.fileForRetrieveBlueprintChallenge) {
              const blueprint = product.fileForRetrieveBlueprintChallenge
              return blueprint
            }
          }
        },
        GetChristmasProduct () {
          return config.get<ProductConfig[]>('products').filter(
            (product) => product.useForChristmasSpecialChallenge
          )[0]
        },
        GetFromMemories (property: string) {
          for (const memory of config.get<MemoryConfig[]>('memories') as any) {
            if (memory[property]) {
              return memory[property]
            }
          }
        },
        GetFromConfig (variable: string) {
          return config.get(variable)
        },
        GetOverwriteUrl () {
          return config.get('challenges.overwriteUrlForProductTamperingChallenge')
        },
        GetPastebinLeakProduct () {
          return config.get<ProductConfig[]>('products').filter(
            (product) => product.keywordsForPastebinDataLeakChallenge
          )[0]
        },
        GetTamperingProductId () {
          const products = config.get<ProductConfig[]>('products')
          for (let i = 0; i < products.length; i++) {
            if (products[i].urlForProductTamperingChallenge) {
              return i + 1
            }
          }
        },
        GenerateAuthenticator (inputString: string) {
          return generateSync({ secret: inputString })
        },
        toISO8601 () {
          const date = new Date()
          return utils.toISO8601(date)
        },
        isDocker () {
          return utils.isDocker()
        },
        isWindows () {
          return utils.isWindows()
        },

        async StartLlmMock () {
          if (mockLlmServer?.listening) return null
          let streamingCallCount = 0

          mockLlmServer = http.createServer((req, res) => {
            let body = ''
            req.on('data', (chunk: Buffer) => { body += chunk.toString() })
            req.on('end', () => {
              let parsed: { stream?: boolean, messages?: Array<{ role?: string, content?: string }> } = {}
              try { parsed = JSON.parse(body) } catch { /* ignore */ }

              if (parsed.stream === true) {
                // streamText calls: first triggers the tool, second sends final text
                streamingCallCount++
                res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
                if (streamingCallCount === 1) {
                  res.write(sseChunk(makeChunk({
                    tool_calls: [{ index: 0, id: 'call_verify_1', type: 'function', function: { name: 'verifySystemPromptExtraction', arguments: '{}' } }]
                  })))
                  res.write(sseChunk(makeChunk({}, 'tool_calls')))
                } else {
                  res.write(sseChunk(makeChunk({ content: 'System prompt successfully verified as extracted.' })))
                  res.write(sseChunk(makeChunk({}, 'stop')))
                }
                res.write('data: [DONE]\n\n')
                res.end()
              } else {
                // generateText call (non-streaming): LLM judge verdict
                const allContent = (parsed.messages ?? []).map((m: { content?: string }) => m.content ?? '').join(' ')
                const judgeAnswer = allContent.toLowerCase().includes('courtesy discount') ? 'YES' : 'NO'
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({
                  id: 'chatcmpl-judge',
                  object: 'chat.completion',
                  created: Math.floor(Date.now() / 1000),
                  model: 'test-model',
                  choices: [{
                    index: 0,
                    message: { role: 'assistant', content: judgeAnswer },
                    finish_reason: 'stop'
                  }]
                }))
              }
            })
          })

          const llmApiUrl: string = config.get('application.chatBot.llmApiUrl')
          const mockPort = parseInt(new URL(llmApiUrl).port || '80')

          return await new Promise<null>((resolve, reject) => {
            if (mockLlmServer) {
              mockLlmServer.once('error', reject)
              mockLlmServer.listen(mockPort, () => { resolve(null) })
            } else {
              resolve(null)
            }
          })
        },

        async StopLlmMock () {
          return await new Promise<null>((resolve) => {
            if (mockLlmServer) {
              mockLlmServer.close(() => {
                mockLlmServer = null
                resolve(null)
              })
            } else {
              resolve(null)
            }
          })
        }
      })
    }
  }
})
