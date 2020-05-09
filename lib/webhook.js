/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const request = require('request')
const colors = require('colors/safe')
const logger = require('../lib/logger')

exports.notify = (challenge) => {
  request.post(process.env.WEBHOOK_URL, {
    json: {
      solution:
        {
          issuer: process.env.ISSUER_TOKEN || null,
          recipient: process.env.RECIPIENT_ID || null,
          challenge: challenge.key,
          evidence: null,
          issuedOn: new Date().toISOString()
        },
      signature: null,
      verifyUrl: null
    }
  }, (error, res) => {
    if (error) {
      console.error(error)
      return
    }
    logger.info(`Webhook ${colors.bold(process.env.WEBHOOK_URL)} notified about ${colors.cyan(challenge.key)} being solved: ${res.statusCode < 400 ? colors.green(res.statusCode) : colors.red(res.statusCode)}`)
  })
}
