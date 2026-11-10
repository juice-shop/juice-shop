/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import * as utils from '../utils'
import logger from '../logger'
import { copyFileSync, existsSync, readdirSync } from 'node:fs'

let restorationPromise: Promise<void> | null = null

const restoreOverwrittenFilesWithOriginals = async () => {
  if (restorationPromise !== null) {
    return await restorationPromise
  }
  restorationPromise = (async () => {
    if (process.env.NODE_ENV === 'test' && existsSync(path.resolve('i18n/en.json'))) {
      return
    }
    try {
      copyFileSync(path.resolve('data/static/legal.md'), path.resolve('ftp/legal.md'))

      if (existsSync(path.resolve('frontend/dist'))) {
        copyFileSync(
          path.resolve('data/static/owasp_promo.vtt'),
          path.resolve('frontend/dist/frontend/assets/public/videos/owasp_promo.vtt')
        )
      }

      const sourceFolder = path.resolve('data/static/i18n')
      const files = readdirSync(sourceFolder).filter((filename) => filename.endsWith('.json'))
      for (const filename of files) {
        copyFileSync(path.join(sourceFolder, filename), path.resolve('i18n/', filename))
      }
    } catch (err) {
      logger.warn('Error restoring i18n files: ' + utils.getErrorMessage(err))
    }
  })()
  return await restorationPromise
}

export default restoreOverwrittenFilesWithOriginals
