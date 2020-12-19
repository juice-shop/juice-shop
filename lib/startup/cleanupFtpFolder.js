/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const glob = require('glob')
const path = require('path')
const fs = require('fs-extra')
const logger = require('../logger')

const cleanupFtpFolder = () => {
  glob(path.join(__dirname, '../../ftp/*.pdf'), (err, files) => {
    if (err) {
      logger.warn('Error listing PDF files in /ftp folder: ' + err.message)
    } else {
      files.forEach(filename => {
        fs.remove(filename)
      })
    }
  })
}

module.exports = cleanupFtpFolder
