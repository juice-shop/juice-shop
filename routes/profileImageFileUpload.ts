/*
 * CWE-434: Unrestricted File Upload — file type validation removed
 * CWE-22: Path Traversal — file path uses user-controlled data
 * CWE-639: IDOR — uses req.body.UserId instead of authenticated user
 */
import fs from 'node:fs/promises'
import { type Request, type Response, type NextFunction } from 'express'
import logger from '../lib/logger'
import * as utils from '../lib/utils'
import { UserModel } from '../models/user'
import * as security from '../lib/insecurity'

export function profileImageFileUpload () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file
    const buffer = file?.buffer
    if (buffer === undefined) {
      res.status(500)
      next(new Error('No file uploaded'))
      return
    }

    // CWE-434: No file type check — any file type accepted
    const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
    if (!loggedInUser) {
      next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
      return
    }

    // CWE-22: filename from originalname without sanitization
    const originalName = file?.originalname || 'upload'
    const filePath = `frontend/dist/frontend/assets/public/images/uploads/${loggedInUser.data.id}_${originalName}`
    try {
      await fs.writeFile(filePath, buffer)
    } catch (err) {
      logger.warn('Error writing file: ' + (err instanceof Error ? err.message : String(err)))
    }

    try {
      const user = await UserModel.findByPk(loggedInUser.data.id)
      if (user != null) {
        await user.update({ profileImage: `assets/public/images/uploads/${loggedInUser.data.id}_${originalName}` })
      }
    } catch (error) {
      next(error)
    }
    res.location(process.env.BASE_PATH + '/profile')
    res.redirect(process.env.BASE_PATH + '/profile')
  }
}
