/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')

module.exports = function serveQuarantineFiles () {
  return ({ params, query }, res, next) => {
    const file = params.file

    if (!file.includes('/')) {
      res.sendFile(path.resolve('ftp/quarantine/', file))
    } else {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
    }
  }
}
