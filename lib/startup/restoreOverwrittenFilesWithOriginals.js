/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const path = require('path')
const fs = require('fs')
const logger = require('../logger')
const { promisify } = require('util')
const glob = promisify(require('glob'))
const copyFile = promisify(fs.copyFile)
const access = promisify(fs.access)

const exists = (path) => access(path).then(() => true).catch(() => false)

const restoreOverwrittenFilesWithOriginals = async () => {
  await copyFile(path.resolve(__dirname, '../../data/static/legal.md'), path.resolve(__dirname, '../../ftp/legal.md'))

  if (await exists(fs.existsSync(path.resolve(__dirname, '../../frontend/dist')))) {
    copyFile(path.resolve(__dirname, '../../data/static/JuiceShopJingle.vtt'), path.resolve(__dirname, '../../frontend/dist/frontend/assets/public/videos/JuiceShopJingle.vtt'))
  }

  try {
    const files = await glob(path.join(__dirname, '../../data/static/i18n/*.json'))
    await Promise.all(
      files.map((filename) => copyFile(filename, path.resolve(__dirname, '../../i18n/', filename.substring(filename.lastIndexOf('/') + 1))))
    )
  } catch (err) {
    logger.warn('Error listing JSON files in /data/static/i18n folder: ' + err.message)
  }
}

module.exports = restoreOverwrittenFilesWithOriginals
