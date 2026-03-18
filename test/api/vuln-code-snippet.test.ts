/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before, after, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import * as http from 'http'
import ioClient from 'socket.io-client'
import { createTestApp } from './helpers/setup'
import registerWebsocketEvents from '../../lib/startup/registerWebsocketEvents'

let app: Express
let server: http.Server
let serverPort: number

before(async () => {
  const result = await createTestApp()
  app = result.app
  await new Promise<void>((resolve) => {
    server = http.createServer(app)
    registerWebsocketEvents(server)
    server.listen(0, () => {
      const addr = server.address()
      if (addr && typeof addr === 'object') {
        serverPort = addr.port
      }
      resolve()
    })
  })
}, { timeout: 60000 })

after(() => {
  if (server) {
    server.close()
  }
})

void describe('/snippets/:challenge', () => {
  void it('GET code snippet retrieval for unknown challenge key throws error', async () => {
    const res = await request(app)
      .get('/snippets/doesNotExistChallenge')

    assert.equal(res.status, 404)
    assert.equal(res.body.error, 'No code challenge for challenge key: doesNotExistChallenge')
  })

  void it('GET code snippet retrieval for challenge without code snippet throws error', async () => {
    const res = await request(app)
      .get('/snippets/easterEggLevelTwoChallenge')

    assert.equal(res.status, 404)
    assert.equal(res.body.error, 'No code challenge for challenge key: easterEggLevelTwoChallenge')
  })

  void it('GET code snippet retrieval for challenge with code snippet', async () => {
    const res = await request(app)
      .get('/snippets/loginAdminChallenge')

    assert.equal(res.status, 200)
    assert.equal(typeof res.body.snippet, 'string')
  })
})

void describe('snippets/verdict', () => {
  let socket: ReturnType<typeof ioClient>

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      socket = ioClient(`http://localhost:${serverPort}`, {
        reconnectionDelay: 0,
        forceNew: true
      })
      socket.on('connect', () => {
        resolve()
      })
    })
  })

  afterEach(() => {
    if (socket.connected) {
      socket.disconnect()
    }
  })

  void it('should check for the incorrect lines', async () => {
    const res = await request(app)
      .post('/snippets/verdict')
      .send({
        selectedLines: [5, 9],
        key: 'resetPasswordJimChallenge'
      })

    assert.equal(res.status, 200)
    assert.equal(typeof res.body.verdict, 'boolean')
    assert.equal(res.body.verdict, false)
  })

  void it('should check for the correct lines', async () => {
    const websocketReceivedPromise = new Promise<void>((resolve) => {
      socket.once('code challenge solved', (data: any) => {
        assert.deepStrictEqual(data, {
          key: 'resetPasswordJimChallenge',
          codingChallengeStatus: 1
        })
        resolve()
      })
    })

    const res = await request(app)
      .post('/snippets/verdict')
      .send({
        selectedLines: [2],
        key: 'resetPasswordJimChallenge'
      })

    assert.equal(res.status, 200)
    assert.equal(typeof res.body.verdict, 'boolean')
    assert.equal(res.body.verdict, true)

    await websocketReceivedPromise
  })
})
