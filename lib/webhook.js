/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const request = require('request')
const colors = require('colors/safe')
const logger = require('../lib/logger')
const utils = require('../lib/utils')
const config = require('config')
const si = require('systeminformation')

exports.notify = (challenge, webhook = process.env.SOLUTIONS_WEBHOOK) => {
  si.get({ osInfo: 'hostname' }).then(sysInfo => {
    request.post(webhook, {
      json: {
        solution:
          {
            challenge: challenge.key,
            evidence: null,
            issuedOn: new Date().toISOString()
          },
        issuer: {
          hostName: sysInfo.osInfo.hostname,
          appName: config.get('application.name'),
          config: process.env.NODE_ENV || 'default',
          version: utils.version()
        }
      }
    }, (error, res) => {
      if (error) {
        logger.error('Webhook notification failed: ' + colors.red(error.message))
        throw error
      }
      logger.info(`Webhook ${colors.bold(webhook)} notified about ${colors.cyan(challenge.key)} being solved: ${res.statusCode < 400 ? colors.green(res.statusCode) : colors.red(res.statusCode)}`)
    })
  })
}
