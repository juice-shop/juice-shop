/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs')
const models = require('../models/index')
const security = require('../lib/insecurity')
const request = require('request')
const logger = require('../lib/logger')

module.exports = function profileImageUrlUpload () {
  return (req, res, next) => {
    if (req.body.imageUrl !== undefined) {
      const url = req.body.imageUrl
      if (url.match(/(.)*solve\/challenges\/server-side(.)*/) !== null) req.app.locals.abused_ssrf_bug = true
      const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        const imageRequest = request
          .get(url)
          .on('error', function (err) {
            models.User.findByPk(loggedInUser.data.id).then(user => { return user.update({ profileImage: url }) }).catch(error => { next(error) })
            logger.warn('Error retrieving user profile image: ' + err.message + '; using image link directly')
          })
          .on('response', function (res) {
            if (res.statusCode === 200) {
              const ext = ['jpg', 'jpeg', 'png', 'svg', 'gif'].includes(url.split('.').slice(-1)[0].toLowerCase()) ? url.split('.').slice(-1)[0].toLowerCase() : 'jpg'
              imageRequest.pipe(fs.createWriteStream(`frontend/dist/frontend/assets/public/images/uploads/${loggedInUser.data.id}.${ext}`))
              models.User.findByPk(loggedInUser.data.id).then(user => { return user.update({ profileImage: `/assets/public/images/uploads/${loggedInUser.data.id}.${ext}` }) }).catch(error => { next(error) })
            } else models.User.findByPk(loggedInUser.data.id).then(user => { return user.update({ profileImage: url }) }).catch(error => { next(error) })
          })
      } else {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
      }
    }
    res.location(process.env.BASE_PATH + '/profile')
    res.redirect(process.env.BASE_PATH + '/profile')
  }
}
