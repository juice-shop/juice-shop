/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const utils = require('../lib/utils')
const fs = require('fs')
const models = require('../models/index')
const insecurity = require('../lib/insecurity')
const logger = require('../lib/logger')
const fileType = require('file-type')

module.exports = function fileUpload () {
  return (req, res, next) => {
    const file = req.file
    const buffer = file.buffer
    const uploadedFileType = fileType(buffer)
    if (uploadedFileType !== null && utils.startsWith(uploadedFileType.mime, 'image')) {
      const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        fs.open(`frontend/dist/frontend/assets/public/images/uploads/${loggedInUser.data.id}.${uploadedFileType.ext}`, 'w', function (err, fd) {
          if (err) logger.warn('Error opening file: ' + err.message)
          fs.write(fd, buffer, 0, buffer.length, null, function (err) {
            if (err) logger.warn('Error writing file: ' + err.message)
            fs.close(fd, function () { })
          })
        })
        models.User.findByPk(loggedInUser.data.id).then(user => {
          return user.update({ profileImage: `assets/public/images/uploads/${loggedInUser.data.id}.${uploadedFileType.ext}` })
        }).catch(error => {
          next(error)
        })
        res.location(process.env.BASE_PATH + '/profile')
        res.redirect(process.env.BASE_PATH + '/profile')
      } else {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
      }
    } else {
      res.status(415)
      next(new Error(`Profile image upload does not accept this file type${uploadedFileType ? (': ' + uploadedFileType.mime) : '.'}`))
    }
  }
}
