/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import { Request, Response, NextFunction } from 'express'

const utils = require('../lib/utils')
const security = require('../lib/insecurity')
const cache = require('../data/datacache')
const challenges = cache.challenges

module.exports = function changePassword () {
  return ({ query, headers, connection }: Request, res: Response, next: NextFunction) => {
    const currentPassword = query.current
    const newPassword = query.new
    const repeatPassword = query.repeat
    if (!newPassword || newPassword === 'undefined') {
      res.status(401).send(res.__('Password cannot be empty.'))
    } else if (newPassword !== repeatPassword) {
      res.status(401).send(res.__('New and repeated password do not match.'))
    } else {
      const token = headers.authorization ? headers.authorization.substr('Bearer='.length) : null
      const loggedInUser = security.authenticatedUsers.get(token)
      if (loggedInUser) {
        if (currentPassword && security.hash(currentPassword) !== loggedInUser.data.password) {
          res.status(401).send(res.__('Current password is not correct.'))
        } else {
          models.User.findByPk(loggedInUser.data.id).then(user => {
            user.update({ password: newPassword }).then(user => {
              utils.solveIf(challenges.changePasswordBenderChallenge, () => { return user.id === 3 && !currentPassword && user.password === security.hash('slurmCl4ssic') })
              res.json({ user })
            }).catch(error => {
              next(error)
            })
          }).catch(error => {
            next(error)
          })
        }
      } else {
        next(new Error('Blocked illegal activity by ' + connection.remoteAddress))
      }
    }
  }
}
