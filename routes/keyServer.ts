/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

export function serveKeyFiles () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const file = path.basename(params.file)

    if (!file.includes('/') && !file.includes('..')) {
      const resolvedPath = path.resolve('encryptionkeys/', file)
      if (resolvedPath.startsWith(path.resolve('encryptionkeys/'))) {
        res.sendFile(resolvedPath)
      } else {
        res.status(403)
        next(new Error('Access denied!'))
      }
    } else {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
    }
  }
}
