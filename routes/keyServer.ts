/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

export function serveKeyFiles () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const file = params.file

    if (typeof file !== 'string' || file.length === 0) {
      res.status(400)
      next(new Error('Invalid file name'))
      return
    }

    if (file.includes('/') || file.includes('\\')) {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
      return
    }

    const baseDir = path.resolve('encryptionkeys')
    const resolvedPath = path.resolve(baseDir, file)
    const relative = path.relative(baseDir, resolvedPath)
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      res.status(403)
      next(new Error('File name must stay within encryption keys directory'))
      return
    }

    res.sendFile(resolvedPath)
  }
}
