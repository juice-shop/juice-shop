import * as frisby from 'frisby'
import assert from 'assert'

const REST_URL = 'http://localhost:3000/rest'
const OLLAMA_URL = 'http://localhost:11434/api/tags'

describe('Chatbot E2E (Real LLM)', function () {
  // LLMs can be slow; 20s timeout ensures the test doesn't quit early
  this.timeout(20000)

  it('should verify that Ollama is running locally', async () => {
    try {
      const response = await fetch(OLLAMA_URL)
      assert.strictEqual(response.status, 200)
    } catch (error) {
      assert.fail('Ollama is not responding. Please run "ollama serve" before testing.')
    }
  })

  it('POST /rest/chat should return a real response from Qwen via Ollama', () => {
    return frisby.post(REST_URL + '/chat', {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
      body: {
        messages: [{ role: 'user', content: 'What is the price of Orange Juice?' }]
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /text\/event-stream/)
      .then((response: any) => {
        const body = response.body as string

        // We check for both words independently to handle streaming splits
        const hasOrange = /orange/i.test(body)
        const hasJuice = /juice/i.test(body)
        const isDone = body.includes('data: [DONE]')

        if (!hasOrange || !hasJuice) {
          throw new Error(`AI response missing product keywords. Received: ${body}`)
        }

        if (!isDone) {
          throw new Error('Response stream did not complete (missing [DONE] signal)')
        }

        console.log('Chatbot E2E: Valid streaming response received from Qwen.')
      })
  })
})
