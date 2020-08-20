/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const frisby = require('frisby')
const config = require('config')
const { bot } = require('../../routes/chatbot')
const fs = require('fs')

const REST_URL = 'http://localhost:3000/rest/'
const trainingData = JSON.parse(fs.readFileSync(`data/static/${config.get('application.chatBot.trainingData')}`, { encoding: 'utf8' }))

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
    return bot.train()
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

    const testCommand = trainingData.intents[0].question

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
    const testCommand = trainingData.intents[0].question

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
    const testCommand = trainingData.intents[0].question
    const testResponse = await bot.respond(testCommand, 12345)
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
      .expect('json', 'body', testResponse.body)
  })

  it('POST returns error for unauthenticated user', () => {
    const testCommand = trainingData.intents[0].question
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

  it('Returns proper response for custom callbacks', () => {
    const { token } = await login({
      email: 'bjoern.kimminich@gmail.com',
      password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
    })
    const testCommand = 'function test command b8a8ba1ecea1607e1713e31a3d9e5e19'
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
