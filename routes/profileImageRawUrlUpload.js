/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const models = require('../models/index')
const insecurity = require('../lib/insecurity')

module.exports = function profileImageURLUpdate () {
  return (req, res, next) => {
    if (req.body.imageUrl !== undefined && req.body.imageUrl.match(/^https:/)) {
      const url = req.body.imageUrl
      const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        models.User.findByPk(loggedInUser.data.id).then(user => {
          return user.update({ profileImage: url })
        }).catch(error => {
          next(error)
        })
      } else {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
      }
    }
    res.location('/profile')
    res.redirect('/profile')
  }
}
