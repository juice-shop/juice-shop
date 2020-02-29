/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const models = require('../models/index')
const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const cache = require('../data/datacache')
const challenges = cache.challenges

module.exports = function updateUserProfile () {
  return (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)

    if (loggedInUser) {
      models.User.findByPk(loggedInUser.data.id).then(user => {
        /* Challenge is solved if request originated from a known HTML ODE and sets a new username */
        if (req.headers.origin.includes('://htmledit.squarefree.com') && req.body.username && utils.notSolved(challenges.csrfChallenge)) {
          utils.solve(challenges.csrfChallenge)
        }

        return user.update({ username: req.body.username })
      }).catch(error => {
        next(error)
      })
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
    res.location('/profile')
    res.redirect('/profile')
  }
}
