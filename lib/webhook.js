/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const request = require('request')
const { promisify } = require('util')
const colors = require('colors/safe')
const logger = require('../lib/logger')
const utils = require('../lib/utils')
const os = require('os')
const config = require('config')
const post = promisify(request.post)

const solves = []

exports.notify = async (challenge, webhook = process.env.SOLUTIONS_WEBHOOK) => {
  const res = await post(webhook, {
    json: {
      solution: {
        challenge: challenge.key,
        cheatScore: calculateCheatScore(challenge),
        totalCheatScore: solves.length > 0 ? solves.map(({ cheatScore }) => cheatScore).reduce((sum, score) => { return sum + score }) / solves.length : 0,
        issuedOn: new Date().toISOString()
      },
      ctfFlag: utils.ctfFlag(challenge.name),
      issuer: {
        hostName: os.hostname(),
        os: `${os.type()} (${os.release()})`,
        appName: config.get('application.name'),
        config: process.env.NODE_ENV || 'default',
        version: utils.version()
      }
    }
  })
  logger.info(`Webhook ${colors.bold(webhook)} notified about ${colors.cyan(challenge.key)} being solved: ${res.statusCode < 400 ? colors.green(res.statusCode) : colors.red(res.statusCode)}`)
}

function calculateCheatScore (challenge) {
  const timestamp = new Date()
  let cheatScore = 0
  if (solves.length > 0) {
    const minutesSincePreviousSolve = (timestamp.getTime() - solves[solves.length - 1].timestamp.getTime()) / 60000
    cheatScore += Math.max(0, 1 - (minutesSincePreviousSolve / (2 * challenge.difficulty)))
  }
  solves.push({ challenge, timestamp, cheatScore })
  return cheatScore
}
