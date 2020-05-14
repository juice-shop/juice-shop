/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const request = require('request')
const colors = require('colors/safe')
const logger = require('../lib/logger')
const utils = require('../lib/utils')
const os = require('os')
const config = require('config')

exports.notify = (challenge) => {
  request.post(process.env.SOLUTIONS_WEBHOOK, {
    json: {
      solution:
        {
          challenge: challenge.key,
          evidence: null,
          issuedOn: new Date().toISOString()
        },
      issuer: {
        hostName: os.hostname(),
        appName: config.get('application.name'),
        config: process.env.NODE_ENV,
        version: utils.version()
      }
    }
  }, (error, res) => {
    if (error) {
      console.error(error)
      return
    }
    logger.info(`Webhook ${colors.bold(process.env.SOLUTIONS_WEBHOOK)} notified about ${colors.cyan(challenge.key)} being solved: ${res.statusCode < 400 ? colors.green(res.statusCode) : colors.red(res.statusCode)}`)
  })
}
