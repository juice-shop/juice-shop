/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const frisby = require('frisby')
const config = require('config')
const { initialize, bot } = require('../../routes/chatbot')
const fs = require('fs')
const utils = require('../../lib/utils')

const REST_URL = 'http://localhost:3000/rest/'
let trainingData

async function login ({ email, password, totpSecret }) {
  const loginRes = await frisby
    .post(REST_URL + '/user/login', {
      email,
      password
    }).catch((res) => {
      if (res.json && res.json.type && res.json.status === 'totp_token_required') {
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

  it('GET bot training state', () => {
    return frisby.get(REST_URL + 'chatbot/status')
      .expect('status', 200)
      .expect('json', 'status', true)
  })

  it('Asks for username if not defined', async () => {
    const { token } = await login({
      email: `J12934@${config.get('application.domain')}`,
      password: '0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB'
    })

    const testCommand = trainingData.data[0].utterances[0]

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
        expect(trainingData.data[0].answers).toContainEqual(json)
      })
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
