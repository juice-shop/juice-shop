/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
import { type Request, type Response, type NextFunction } from 'express'

module.exports = function serveLogFiles () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const file = params.file
    const logsDir = path.resolve('logs/')
    const filePath = path.join(logsDir, file)

    if (filePath.startsWith(logsDir)) {
      res.sendFile(filePath)
    } else {
      res.status(403)
      next(new Error('Access to this file is not allowed!'))
    }
  }
}