/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import glob = require('glob')
const path = require('path')
const fs = require('fs-extra')
const logger = require('../logger')

const cleanupFtpFolder = () => {
  glob(path.resolve('ftp/*.pdf'), (err, files) => {
    if (err != null) {
      logger.warn('Error listing PDF files in /ftp folder: ' + err.message)
    } else {
      files.forEach(filename => {
        fs.remove(filename)
      })
    }
  })
}

module.exports = cleanupFtpFolder
