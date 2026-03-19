/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

export function serveLogFiles () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const file = params.file

    if (!file.includes('/')) {
      const safeBase = path.resolve('logs/');
      const target = path.resolve('logs/', file);
      if (!target.startsWith(safeBase)) {
        return res.status(403).send('Access denied');
      }
      res.sendFile(target);
    } else {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
    }
  }
}
