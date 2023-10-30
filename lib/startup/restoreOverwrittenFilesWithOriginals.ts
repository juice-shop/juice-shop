```typescript
import path = require('path')
import utils = require('../utils')
import logger from '../logger')
import { promisify } from 'util'
const fs = require('fs')
const glob = promisify(require('glob'))
const copyFile = promisify(fs.copyFile)
const access = promisify(fs.access)

const exists = (path: string) => access(path).then(() => true).catch(() => false)

const restoreOverwrittenFilesWithOriginals = async () => {
  const legalPath = path.normalize('data/static/legal.md')
  if (!legalPath.startsWith('data/static/')) throw new Error('Invalid path')
  await copyFile(path.resolve(legalPath), path.resolve('ftp/legal.md'))

  if (await exists(path.resolve('frontend/dist'))) {
    const promoPath = path.normalize('data/static/owasp_promo.vtt')
    if (!promoPath.startsWith('data/static/')) throw new Error('Invalid path')
    await copyFile(
      path.resolve(promoPath),
      path.resolve('frontend/dist/frontend/assets/public/videos/owasp_promo.vtt')
    )
  }

  try {
    const files = await glob(path.resolve('data/static/i18n/*.json'))
    await Promise.all(
      files.map((filename: string) => {
        const filePath = path.normalize(filename)
        if (!filePath.startsWith('data/static/i18n/')) throw new Error('Invalid path')
        return copyFile(filePath, path.resolve('i18n/', filePath.substring(filePath.lastIndexOf('/') + 1)))
      })
    )
  } catch (err) {
    logger.warn('Error listing JSON files in /data/static/i18n folder: ' + utils.getErrorMessage(err))
  }
}

module.exports = restoreOverwrittenFilesWithOriginals
```