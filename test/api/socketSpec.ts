/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import io = require('socket.io-client')

describe('WebSocket', () => {
  let socket

  beforeEach(done => {
    socket = io('http://localhost:3000', {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true
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

  it('server handles confirmation messages for emitted challenge resolutions', done => {
    socket.emit('notification received', 'Find the carefully hidden \'Score Board\' page.')
    socket.emit('notification received', 'Provoke an error that is not very gracefully handled.')
    socket.emit('notification received', 'Log in with the administrator\'s user account.')
    socket.emit('notification received', 'Retrieve a list of all user credentials via SQL Injection')
    socket.emit('notification received', 'Post some feedback in another users name.')
    socket.emit('notification received', 'Wherever you go, there you are.')
    socket.emit('notification received', 'Place an order that makes you rich.')
    socket.emit('notification received', 'Access a confidential document.')
    socket.emit('notification received', 'Access a salesman\'s forgotten backup file.')
    socket.emit('notification received', 'Change Bender\'s password into slurmCl4ssic.')
    socket.emit('notification received', 'Apply some advanced cryptanalysis to find the real easter egg.')
    done()
  })

  it('server handles confirmation message for a non-existent challenge', done => {
    socket.emit('notification received', 'Emit a confirmation for a challenge that was never emitted!')
    done()
  })

  it('server handles empty confirmation message', done => {
    socket.emit('notification received', undefined)
    done()
  })
})
