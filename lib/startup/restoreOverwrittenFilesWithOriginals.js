/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const glob = require('glob')
const path = require('path')
const fs = require('fs')
const logger = require('../logger')

const restoreOverwrittenFilesWithOriginals = () => {
  fs.copyFileSync(path.resolve(__dirname, '../../data/static/legal.md'), path.resolve(__dirname, '../../ftp/legal.md'))
  if (fs.existsSync(path.resolve(__dirname, '../../frontend/dist'))) {
    fs.copyFileSync(path.resolve(__dirname, '../../data/static/JuiceShopJingle.vtt'), path.resolve(__dirname, '../../frontend/dist/frontend/assets/public/videos/JuiceShopJingle.vtt'))
  }
  glob(path.join(__dirname, '../../data/static/i18n/*.json'), (err, files) => {
    if (err) {
      logger.warn('Error listing JSON files in /data/static/i18n folder: ' + err.message)
    } else {
      files.forEach(filename => {
        fs.copyFileSync(filename, path.resolve(__dirname, '../../i18n/', filename.substring(filename.lastIndexOf('/') + 1)))
      })
    }
  })
}

module.exports = restoreOverwrittenFilesWithOriginals
