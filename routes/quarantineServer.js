/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const path = require('path')

module.exports = function serveQuarantineFiles () {
  return ({ params, query }, res, next) => {
    const file = params.file

    if (!file.includes('/')) {
      res.sendFile(path.resolve(__dirname, '../ftp/quarantine/', file))
    } else {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
    }
  }
}
