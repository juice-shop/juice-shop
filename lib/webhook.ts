/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import os from 'node:os'
import config from 'config'
import colors from 'colors/safe'

import logger from './logger'
import * as utils from './utils'
import { totalCheatScore } from './antiCheat'

export const notify = async (challenge: { key: any, name: any }, cheatScore = -1, hintsAvailable = 0, hintsUnlocked = 0, webhook = process.env.SOLUTIONS_WEBHOOK) => {
  if (!webhook) {
    return
  }
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      solution: {
        challenge: challenge.key,
        hintsAvailable,
        hintsUnlocked,
        cheatScore,
        totalCheatScore: totalCheatScore(),
        issuedOn: new Date().toISOString()
      },
      ctfFlag: utils.ctfFlag(challenge.name),
      issuer: {
        hostName: os.hostname(),
        os: `${os.type()} (${os.release()})`,
        appName: config.get<string>('application.name'),
        config: process.env.NODE_ENV ?? 'default',
        version: utils.version()
      }
    })
  })
  logger.info(`Webhook ${colors.bold(webhook)} notified about ${colors.cyan(challenge.key)} being solved: ${res.ok ? colors.green(res.status.toString()) : colors.red(res.status.toString())}`)
}
