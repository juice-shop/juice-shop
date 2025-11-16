/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { glob } from 'glob'
import logger from '../logger'
import fs from 'fs-extra'
import * as utils from '../utils'

const cleanupFtpFolder = async () => {
  try {
    const files = await glob('ftp/*.pdf')
    for (const filename of files) {
      await fs.remove(filename)
    }
  } catch (err) {
    logger.warn('Error listing PDF files in /ftp folder: ' + utils.getErrorMessage(err))
  }
}
export default cleanupFtpFolder
