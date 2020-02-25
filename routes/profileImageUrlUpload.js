/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs')
const models = require('../models/index')
const insecurity = require('../lib/insecurity')
const request = require('request')
const logger = require('../lib/logger')

module.exports = function profileImageUrlUpload () {
  function setProfileImage (userid, imageUrl, next) {
    models.User.findByPk(userid).then(user => {
      return user.update({ profileImage: imageUrl })
    }).catch(error => { next(error) })
  }

  return (req, res, next) => {
    if (req.body.imageUrl !== undefined) {
      const url = req.body.imageUrl
      if (url.match(/(.)*solve\/challenges\/server-side(.)*/) !== null) {
        req.app.locals.abused_ssrf_bug = true
      }
      const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        const imageRequest = request
          .get(url)
          .on('error', function (err) {
            setProfileImage(loggedInUser.data.id, url, next)
            logger.warn('Error retrieving user profile image: ' + err.message + '; using image link directly')
          })
          .on('response', function (res) {
            if (res.statusCode === 200) {
              imageRequest.pipe(fs.createWriteStream(`frontend/dist/frontend/assets/public/images/uploads/${loggedInUser.data.id}.jpg`))
              setProfileImage(loggedInUser.data.id, `/assets/public/images/uploads/${loggedInUser.data.id}.jpg`, next)
            } else setProfileImage(loggedInUser.data.id, url, next)
          })
      } else {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
      }
    }
    res.location('/profile')
    res.redirect('/profile')
  }
}
