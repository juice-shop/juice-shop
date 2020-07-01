/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const frisby = require('frisby')
const config = require('config')
const { bot } = require('../../routes/chatbot')

const REST_URL = 'http://localhost:3000/rest/'

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
  
    if (loginRes.json.status && loginRes.json.status === 'totp_token_required') {
      const totpRes = await frisby
        .post(REST_URL + '/2fa/verify', {
          tmpToken: loginRes.json.data.tmpToken,
          totpToken: otplib.authenticator.generate(totpSecret)
        })
  
      return totpRes.json.authentication
    }
  
    return loginRes.json.authentication
}

describe ('/chatbot', () => {
    beforeAll(async () => {
        return bot.train()
    })

    it('GET bot training state', () => {
        return frisby.get(REST_URL + 'chatbot/status')
            .expect('status', 200)
            .expect('json', 'status', true)
    })

    it('Returns greeting for new user',async () => {
        const { token } = await login({
            email: `J12934@${config.get('application.domain')}`,
            password: '0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB'
        })
        console.log(token)
        return frisby.setup({
            request: {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        }, true)
            .post(REST_URL + 'chatbot/respond', {
            body: {
                query: config.get('application.chatBot.testCommand')
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
        return frisby.setup({
            request: {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        }, true)
            .post(REST_URL + 'chatbot/respond', {
            body: {
                query: config.get('application.chatBot.testCommand')
            }
        })
            .expect('status', 200)
            .expect('json', 'action', 'response')
            .expect('json', 'body', config.get('application.chatBot.testResponse'))
    })

    it('POST returns error for unauthenticated user', () => {
        return frisby.setup({
            request: {
                headers: {
                    'Authorization': 'Bearer faketoken',
                    'Content-Type': 'application/json'
                }
            }
        }, true)
            .post(REST_URL + 'chatbot/respond', {
            body: {
                query: config.get('application.chatBot.testCommand')
            }
        })
            .expect('status', 401)
            .expect('json', 'error', 'Unauthenticated user')
    })
})
