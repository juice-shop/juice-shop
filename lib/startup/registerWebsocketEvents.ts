/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import * as utils from '../utils'
import { Server, Socket } from 'socket.io'
import { notifications, challenges } from '../../data/datacache'
import * as challengeUtils from '../challengeUtils'
import * as security from '../insecurity'

let firstConnectedSocket: string | null = null

const globalWithSocketIO = global as typeof globalThis & {
  io: Server
}

const registerWebsocketEvents = (server: any): void => {
  const io = new Server(server, { cors: { origin: 'http://localhost:4200' } })
  globalWithSocketIO.io = io

  io.on('connection', (socket: Socket) => {
    if (firstConnectedSocket === null) {
      socket.emit('server started')
      firstConnectedSocket = socket.id
    }

    notifications.forEach((notification: any) => {
      socket.emit('challenge solved', notification)
    })

    socket.on('notification received', (data: any) => {
      const i = notifications.findIndex(({ flag }: any) => flag === data)
      if (i > -1) {
        notifications.splice(i, 1)
      }
    })

    socket.on('verifyLocalXssChallenge', (data: any) => {
      challengeUtils.solveIf(
        challenges.localXssChallenge,
        () => utils.contains(data, '<iframe src="javascript:alert(`xss`)">')
      )
      challengeUtils.solveIf(
        challenges.xssBonusChallenge,
        () => utils.contains(data, config.get('challenges.xssBonusPayload'))
      )
    })

    socket.on('verifySvgInjectionChallenge', (data: any) => {
      challengeUtils.solveIf(
        challenges.svgInjectionChallenge,
        () =>
          data?.match(/.*\.\.\/\.\.\/\.\.[\w/-]*?\/redirect\?to=https?:\/\/placecats.com\/(g\/)?[\d]+\/[\d]+.*/) &&
          security.isRedirectAllowed(data)
      )
    })

    socket.on('verifyCloseNotificationsChallenge', (data: any) => {
      challengeUtils.solveIf(
        challenges.closeNotificationsChallenge,
        () => Array.isArray(data) && data.length > 1
      )
    })
  })
}

export default registerWebsocketEvents
