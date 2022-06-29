/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import request = require('request')
const { promisify } = require('util')
const colors = require('colors/safe')
const antiCheat = require('./antiCheat')
const logger = require('./logger')
const utils = require('./utils')
const os = require('os')
const config = require('config')
const post = promisify(request.post)

export const notify = async (challenge: { key: any, name: any }, cheatScore = -1, webhook = process.env.SOLUTIONS_WEBHOOK) => {
  const res = await post(webhook, {
    json: {
      solution: {
        challenge: challenge.key,
        cheatScore: cheatScore,
        totalCheatScore: antiCheat.totalCheatScore(),
        issuedOn: new Date().toISOString()
      },
      ctfFlag: utils.ctfFlag(challenge.name),
      issuer: {
        hostName: os.hostname(),
        os: `${os.type()} (${os.release()})`,
        appName: config.get('application.name'),
        config: process.env.NODE_ENV ?? 'default',
        version: utils.version()
      }
    }
  })
  logger.info(`Webhook ${colors.bold(webhook)} notified about ${colors.cyan(challenge.key)} being solved: ${res.statusCode < 400 ? colors.green(res.statusCode) : colors.red(res.statusCode)}`)
}
