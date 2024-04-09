/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { expect } from '@jest/globals'
import frisby = require('frisby')
import io from 'socket.io-client'
import { Joi } from 'frisby'

const URL = 'http://localhost:3000'

describe('/snippets/fixes/:key', () => {
  it('GET fixes for unknown challenge key throws error', () => {
    return frisby.get(URL + '/snippets/fixes/doesNotExistChallenge')
      .expect('status', 404)
      .expect('json', 'error', 'No fixes found for the snippet!')
  })

  it('GET fixes for existing challenge key', () => {
    return frisby.get(URL + '/snippets/fixes/resetPasswordBenderChallenge')
      .expect('status', 200)
      .expect('jsonTypes', {
        fixes: Joi.array().items(Joi.string())
      })
      .expect('jsonTypes', {
        fixes: Joi.array().length(3)
      })
  })
})

describe('/snippets/fixes', () => {
  let socket: SocketIOClient.Socket

  beforeEach(done => {
    socket = io('http://localhost:3000', {
      reconnectionDelay: 0,
      forceNew: true
    })
    socket.on('connect', () => {
      done()
    })
  })

  afterEach(done => {
    if (socket.connected) {
      socket.disconnect()
    }
    done()
  })

  it('POST fix for non-existing challenge key throws error', () => {
    return frisby.post(URL + '/snippets/fixes', {
      body: {
        key: 'doesNotExistChallenge',
        selectedFix: 1
      }
    })
      .expect('status', 404)
      .expect('json', 'error', 'No fixes found for the snippet!')
  })

  it('POST wrong fix for existing challenge key gives negative verdict and explanation', () => {
    return frisby.post(URL + '/snippets/fixes', {
      body: {
        key: 'resetPasswordBenderChallenge',
        selectedFix: 0
      }
    })
      .expect('status', 200)
      .expect('json', {
        verdict: false,
        explanation: 'While not necessarily as trivial to research via a user\'s LinkedIn profile, the question is still easy to research or brute force when answered truthfully.'
      })
  })

  it('POST non-existing fix for existing challenge key gives negative verdict and no explanation', () => {
    return frisby.post(URL + '/snippets/fixes', {
      body: {
        key: 'resetPasswordBenderChallenge',
        selectedFix: 42
      }
    })
      .expect('status', 200)
      .expect('json', {
        verdict: false
      })
  })

  it('POST correct fix for existing challenge key gives positive verdict and explanation', async () => {
    const websocketReceivedPromise = new Promise<void>((resolve) => {
      socket.once('code challenge solved', (data: any) => {
        expect(data).toEqual({
          key: 'resetPasswordBenderChallenge',
          codingChallengeStatus: 2
        })
        resolve()
      })
    })

    await frisby.post(URL + '/snippets/fixes', {
      body: {
        key: 'resetPasswordBenderChallenge',
        selectedFix: 1
      }
    })
      .expect('status', 200)
      .expect('json', {
        verdict: true,
        explanation: 'When answered truthfully, all security questions are susceptible to online research (on Facebook, LinkedIn etc.) and often even brute force. If at all, they should not be used as the only factor for a security-relevant function.'
      })
      .promise()

    await websocketReceivedPromise
  })
})
