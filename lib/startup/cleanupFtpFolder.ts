/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import { readdir, rm } from 'node:fs/promises'
import logger from '../logger'
import * as utils from '../utils'

const cleanupFtpFolder = async () => {
  try {
    const files = (await readdir('ftp')).filter((filename) => filename.endsWith('.pdf'))
    for (const filename of files) {
      await rm(path.join('ftp', filename), { force: true, recursive: true })
    }
  } catch (err) {
    logger.warn('Error listing PDF files in /ftp folder: ' + utils.getErrorMessage(err))
  }
}
export default cleanupFtpFolder
