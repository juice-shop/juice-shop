/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
import config = require('config')
const { initialize, bot } = require('../../routes/chatbot')
const fs = require('fs')
const utils = require('../../lib/utils')

const REST_URL = 'http://localhost:3000/rest/'
const API_URL = 'http://localhost:3000/api/'
let trainingData: { data: any[] }

async function login ({ email, password }: { email: string, password: string }) {
  // @ts-expect-error
  const loginRes = await frisby
    .post(REST_URL + '/user/login', {
      email,
      password
    }).catch((res: any) => {
      if (res.json?.type && res.json.status === 'totp_token_required') {
        return res
      }
      throw new Error(`Failed to login '${email}'`)
    })

  return loginRes.json.authentication
}

describe('/chatbot', () => {
  beforeAll(async () => {
    await initialize()
    trainingData = JSON.parse(fs.readFileSync(`data/chatbot/${utils.extractFilename(config.get('application.chatBot.trainingData'))}`, { encoding: 'utf8' }))
  })

  describe('/status', () => {
    it('GET bot training state', () => {
      return frisby.get(REST_URL + 'chatbot/status')
        .expect('status', 200)
        .expect('json', 'status', true)
    })

    it('GET bot state for anonymous users contains log in request', () => {
      return frisby.get(REST_URL + 'chatbot/status')
        .expect('status', 200)
        .expect('json', 'body', /Sign in to talk/)
    })

    it('GET bot state for authenticated users contains request for username', async () => {
      const { token } = await login({
        email: `J12934@${config.get('application.domain')}`,
        password: '0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB'
      })

      await void frisby.setup({
        request: {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      }, true).get(REST_URL + 'chatbot/status')
        .expect('status', 200)
        .expect('json', 'body', /What shall I call you?/)
    })
  })

  describe('/respond', () => {
    it('Asks for username if not defined', async () => {
      const { token } = await login({
        email: `J12934@${config.get('application.domain')}`,
        password: '0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB'
      })

      const testCommand = trainingData.data[0].utterances[0]

      await void frisby.setup({
        request: {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      }, true)
        .post(REST_URL + 'chatbot/respond', {
          body: {
            action: 'query',
            query: testCommand
          }
        })
        .expect('status', 200)
        .expect('json', 'action', 'namequery')
        .expect('json', 'body', 'I\'m sorry I didn\'t get your name. What shall I call you?')
    })

    it('Returns greeting if username is defined', async () => {
      const { token } = await login({
        email: 'bjoern.kimminich@gmail.com',
        password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
      })

      bot.addUser('1337', 'bkimminich')
      const testCommand = trainingData.data[0].utterances[0]

      await void frisby.setup({
        request: {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      }, true)
        .post(REST_URL + 'chatbot/respond', {
          body: {
            action: 'query',
            query: testCommand
          }
        })
        .expect('status', 200)
        .expect('json', 'action', 'response')
        .expect('json', 'body', bot.greet('1337'))
    })

    it('Returns proper response for registered user', async () => {
      const { token } = await login({
        email: 'bjoern.kimminich@gmail.com',
        password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
      })
      bot.addUser('12345', 'bkimminich')
      const testCommand = trainingData.data[0].utterances[0]
      await void frisby.setup({
        request: {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      }, true)
        .post(REST_URL + 'chatbot/respond', {
          body: {
            action: 'query',
            query: testCommand
          }
        })
        .post(REST_URL + 'chatbot/respond', {
          body: {
            action: 'query',
            query: testCommand
          }
        })
        .expect('status', 200)
        .then(({ json }) => {
          // @ts-expect-error
          expect(trainingData.data[0].answers).toContainEqual(json)
        })
    })

    it('Responds with product price when asked question with product name', async () => {
      const { token } = await login({
        email: 'bjoern.kimminich@gmail.com',
        password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
      })
      await void frisby.get(API_URL + '/Products/1')
        .expect('status', 200)
        .then(({ json }) => {
          return frisby.setup({
            request: {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          }, true)
            .post(REST_URL + 'chatbot/respond', {
              body: {
                action: 'query',
                query: 'How much is ' + json.data.name + '?'
              }
            })
            .expect('status', 200)
            .expect('json', 'action', 'response')
            .then(({ body = json.body }) => {
              expect(body).toContain(`${json.data.name} costs ${json.data.price}¤`)
            })
        })
    })

    it('Greets back registered user after being told username', async () => {
      const { token } = await login({
        email: `stan@${config.get('application.domain')}`,
        password: 'ship coffin krypt cross estate supply insurance asbestos souvenir'
      })
      await void frisby.setup({
        request: {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      }, true)
        .post(REST_URL + 'chatbot/respond', {
          body: {
            action: 'setname',
            query: 'NotGuybrushThreepwood'
          }
        })
        .expect('status', 200)
        .expect('json', 'action', 'response')
        .expect('json', 'body', /NotGuybrushThreepwood/)
    })

    it('POST returns error for unauthenticated user', () => {
      const testCommand = trainingData.data[0].utterances[0]
      return frisby.setup({
        request: {
          headers: {
            Authorization: 'Bearer faketoken',
            'Content-Type': 'application/json'
          }
        }
      }, true)
        .post(REST_URL + 'chatbot/respond', {
          body: {
            query: testCommand
          }
        })
        .expect('status', 401)
        .expect('json', 'error', 'Unauthenticated user')
    })

    it('Returns proper response for custom callbacks', async () => {
      const functionTest = trainingData.data.filter(data => data.intent === 'queries.functionTest')
      const { token } = await login({
        email: 'bjoern.kimminich@gmail.com',
        password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
      })
      const testCommand = functionTest[0].utterances[0]
      const testResponse = '3be2e438b7f3d04c89d7749f727bb3bd'
      await void frisby.setup({
        request: {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      }, true)
        .post(REST_URL + 'chatbot/respond', {
          body: {
            action: 'query',
            query: testCommand
          }
        })
        .post(REST_URL + 'chatbot/respond', {
          body: {
            action: 'query',
            query: testCommand
          }
        })
        .expect('status', 200)
        .expect('json', 'action', 'response')
        .expect('json', 'body', testResponse)
    })
  })
})
