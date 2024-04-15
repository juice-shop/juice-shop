/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import glob = require('glob')
import logger from '../logger'
import path from 'path'
import * as utils from '../utils'
const fs = require('fs-extra')

const cleanupFtpFolder = () => {
  const ftpFolderPath = path.resolve('ftp')
  const allowedExtension = '.pdf'

  glob(path.join(ftpFolderPath, '*' + allowedExtension), (err: Error | null, files: string[]) => {
    if (err) {
      logger.warn('Error listing PDF files in /ftp folder: ' + utils.getErrorMessage(err))
      return
    }

    files.forEach((filename: string) => {
      if (!filename.startsWith(ftpFolderPath)) {
        logger.warn(`Attempted to delete file outside of ftp folder: ${filename}`)
        return
      }

      if (!filename.endsWith(allowedExtension)) {
        logger.warn(`Attempted to delete file with invalid extension: ${filename}`)
        return
      }

      fs.remove(filename, (err: Error | null) => {
        if (err) {
          logger.warn(`Error deleting file ${filename}: ${err.message}`)
        } else {
          logger.info(`File ${filename} deleted successfully`)
        }
      })
    })
  })
}

module.exports = cleanupFtpFolder
