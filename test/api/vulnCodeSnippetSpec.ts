/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { expect } from '@jest/globals'
import * as frisby from 'frisby'
import io from 'socket.io-client'
const Joi = frisby.Joi

const URL = 'http://localhost:3000'

describe('/snippets/:challenge', () => {
  it('GET code snippet retrieval for unknown challenge key throws error', () => {
    return frisby.get(URL + '/snippets/doesNotExistChallenge')
      .expect('status', 404)
      .expect('json', 'error', 'No code challenge for challenge key: doesNotExistChallenge')
  })

  it('GET code snippet retrieval for challenge without code snippet throws error', () => {
    return frisby.get(URL + '/snippets/easterEggLevelTwoChallenge')
      .expect('status', 404)
      .expect('json', 'error', 'No code challenge for challenge key: easterEggLevelTwoChallenge')
  })

  it('GET code snippet retrieval for challenge with code snippet', () => {
    return frisby.get(URL + '/snippets/loginAdminChallenge')
      .expect('status', 200)
      .expect('jsonTypes', {
        snippet: Joi.string(),
        vulnLines: Joi.array()
      })
  })
})

describe('snippets/verdict', () => {
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

  it('should check for the incorrect lines', () => {
    return frisby.post(URL + '/snippets/verdict', {
      body: {
        selectedLines: [5, 9],
        key: 'resetPasswordJimChallenge'
      }
    })
      .expect('status', 200)
      .expect('jsonTypes', {
        verdict: Joi.boolean()
      })
      .expect('json', {
        verdict: false
      })
  })

  it('should check for the correct lines', async () => {
    const websocketReceivedPromise = new Promise<void>((resolve) => {
      socket.once('code challenge solved', (data: any) => {
        expect(data).toEqual({
          key: 'resetPasswordJimChallenge',
          codingChallengeStatus: 1
        })
        resolve()
      })
    })

    await frisby.post(URL + '/snippets/verdict', {
      body: {
        selectedLines: [2],
        key: 'resetPasswordJimChallenge'
      }
    })
      .expect('status', 200)
      .expect('jsonTypes', {
        verdict: Joi.boolean()
      })
      .expect('json', {
        verdict: true
      })
      .promise()

    await websocketReceivedPromise
  })
})
