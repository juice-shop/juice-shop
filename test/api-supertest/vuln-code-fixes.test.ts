/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before, after, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import * as http from 'http'
import { io as ioClient, type Socket } from 'socket.io-client'
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

void describe('/snippets/fixes/:key', () => {
  void it('GET fixes for unknown challenge key throws error', async () => {
    const res = await request(app)
      .get('/snippets/fixes/doesNotExistChallenge')

    assert.equal(res.status, 404)
    assert.equal(res.body.error, 'No fixes found for the snippet!')
  })

  void it('GET fixes for existing challenge key', async () => {
    const res = await request(app)
      .get('/snippets/fixes/resetPasswordBenderChallenge')

    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.body.fixes))
    assert.equal(res.body.fixes.length, 3)
    for (const fix of res.body.fixes) {
      assert.equal(typeof fix, 'string')
    }
  })
})

void describe('/snippets/fixes', () => {
  let socket: Socket

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

  void it('POST fix for non-existing challenge key throws error', async () => {
    const res = await request(app)
      .post('/snippets/fixes')
      .send({
        key: 'doesNotExistChallenge',
        selectedFix: 1
      })

    assert.equal(res.status, 404)
    assert.equal(res.body.error, 'No fixes found for the snippet!')
  })

  void it('POST wrong fix for existing challenge key gives negative verdict and explanation', async () => {
    const res = await request(app)
      .post('/snippets/fixes')
      .send({
        key: 'resetPasswordBenderChallenge',
        selectedFix: 0
      })

    assert.equal(res.status, 200)
    assert.equal(res.body.verdict, false)
    assert.equal(res.body.explanation, 'While not necessarily as trivial to research via a user\'s LinkedIn profile, the question is still easy to research or brute force when answered truthfully.')
  })

  void it('POST non-existing fix for existing challenge key gives negative verdict and no explanation', async () => {
    const res = await request(app)
      .post('/snippets/fixes')
      .send({
        key: 'resetPasswordBenderChallenge',
        selectedFix: 42
      })

    assert.equal(res.status, 200)
    assert.equal(res.body.verdict, false)
  })

  void it('POST correct fix for existing challenge key gives positive verdict and explanation', async () => {
    const websocketReceivedPromise = new Promise<void>((resolve) => {
      socket.once('code challenge solved', (data: any) => {
        assert.deepStrictEqual(data, {
          key: 'resetPasswordBenderChallenge',
          codingChallengeStatus: 2
        })
        resolve()
      })
    })

    const res = await request(app)
      .post('/snippets/fixes')
      .send({
        key: 'resetPasswordBenderChallenge',
        selectedFix: 1
      })

    assert.equal(res.status, 200)
    assert.equal(res.body.verdict, true)
    assert.equal(res.body.explanation, 'When answered truthfully, all security questions are susceptible to online research (on Facebook, LinkedIn etc.) and often even brute force. If at all, they should not be used as the only factor for a security-relevant function.')

    await websocketReceivedPromise
  })
})
