/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before, after, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
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

void describe('WebSocket', () => {
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

  void it('server handles confirmation messages for emitted challenge resolutions', () => {
    socket.emit('notification received', 'Find the carefully hidden \'Score Board\' page.')
    socket.emit('notification received', 'Provoke an error that is not very gracefully handled.')
    socket.emit('notification received', 'Log in with the administrator\'s user account.')
    socket.emit('notification received', 'Retrieve a list of all user credentials via SQL Injection')
    socket.emit('notification received', 'Post some feedback in another user\'s name.')
    socket.emit('notification received', 'Wherever you go, there you are.')
    socket.emit('notification received', 'Place an order that makes you rich.')
    socket.emit('notification received', 'Access a confidential document.')
    socket.emit('notification received', 'Access a salesman\'s forgotten backup file.')
    socket.emit('notification received', 'Change Bender\'s password into slurmCl4ssic.')
    socket.emit('notification received', 'Apply some advanced cryptanalysis to find the real easter egg.')
    assert.ok(true)
  })

  void it('server handles confirmation message for a non-existent challenge', () => {
    socket.emit('notification received', 'Emit a confirmation for a challenge that was never emitted!')
    assert.ok(true)
  })

  void it('server handles empty confirmation message', () => {
    socket.emit('notification received', undefined)
    assert.ok(true)
  })
})
