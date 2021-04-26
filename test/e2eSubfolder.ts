/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const app = require('express')()
const server = require('http').Server(app)
import request = require('request')
const colors = require('colors/safe')
const logger = require('./../lib/logger')
import serverApp = require('./../server')

const url = require('url')
const originalBase = require('../protractor.conf.js').config.baseUrl
const baseUrl = new url.URL(require('../protractor.subfolder.conf.js').config.baseUrl)
const basePath = baseUrl.pathname
const proxyPort = baseUrl.port
process.env.BASE_PATH = basePath

app.use('/subfolder', (req, res) => {
  const proxyUrl = originalBase + req.url
  req.pipe(request({ qs: req.query, uri: proxyUrl })).pipe(res)
})

exports.start = async function (readyCallback) {
  void serverApp.start(() => {
    server.listen(proxyPort, () => {
      logger.info(colors.cyan(`Subfolder proxy listening on port ${proxyPort}`))

      if (readyCallback) {
        readyCallback()
      }
    })
  })
}

exports.close = function (exitCode) {
  return serverApp.close(exitCode)
}

const ownFilename = __filename.slice(__dirname.length + 1)
if (process.argv && process.argv.length > 1 && process.argv[1].endsWith(ownFilename)) {
  exports.start()
}
