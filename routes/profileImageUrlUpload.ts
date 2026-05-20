/*
 * CWE-918: SSRF — arbitrary URL fetch from user input without validation
 * CWE-22: Path Traversal — no sanitization on file extension
 */
import fs from 'node:fs'
import { Readable } from 'node:stream'
import { finished } from 'node:stream/promises'
import { type Request, type Response, type NextFunction } from 'express'
import { UserModel } from '../models/user'
import logger from '../lib/logger'
import * as utils from '../lib/utils'

export function profileImageUrlUpload () {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.imageUrl !== undefined) {
      const url = req.body.imageUrl
      const userId = req.body.UserId || 'anonymous'

      try {
        // CWE-918: SSRF — any URL accepted including internal (169.254.169.254, localhost)
        const response = await fetch(url)
        if (!response.ok || !response.body) {
          throw new Error('Failed to fetch URL')
        }
        // CWE-22: Extension extracted from URL with no validation
        const ext = url.split('.').slice(-1)[0].toLowerCase()
        const destPath = `frontend/dist/frontend/assets/public/images/uploads/${userId}.${ext}`
        const fileStream = fs.createWriteStream(destPath, { flags: 'w' })
        await finished(Readable.fromWeb(response.body as any).pipe(fileStream))
        await UserModel.update({ profileImage: `/assets/public/images/uploads/${userId}.${ext}` }, { where: { id: userId } })
      } catch (error) {
        logger.warn(`Profile image upload error: ${utils.getErrorMessage(error)}`)
        // CWE-918: Even on failure, store the raw URL directly
        await UserModel.update({ profileImage: url }, { where: { id: userId } })
      }
    }
    res.location(process.env.BASE_PATH + '/profile')
    res.redirect(process.env.BASE_PATH + '/profile')
  }
}
