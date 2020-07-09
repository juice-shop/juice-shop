/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const frisby = require('frisby')
const config = require('config')
const { bot } = require('../../routes/chatbot')
const fs = require('fs')

const REST_URL = 'http://localhost:3000/rest/'
const trainingData = JSON.parse(fs.readFileSync(`data/BotTrainingData/${config.get('application.chatBot.trainingData')}`, { encoding: 'utf8' }))

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

  it('Returns greeting for new user', async () => {
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
          query: testCommand
        }
      })
      .expect('status', 200)
      .expect('json', 'action', 'response')
      .expect('json', 'body', bot.greet())
  })

  it('Returns proper response for registered user', async () => {
    const { token } = await login({
      email: `J12934@${config.get('application.domain')}`,
      password: '0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB'
    })
    bot.addUser('12345', 'J12934')
    const testCommand = trainingData.intents[0].question
    const testResponse = await bot.respond(testCommand, 12345)
    return frisby.setup({
      request: {
        headers: {
          Authorization: `Bearer 12345`,
          'Content-Type': 'application/json'
        }
      }
    }, true)
      .post(REST_URL + 'chatbot/respond', {
        body: {
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
})
