/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import { Request, Response, NextFunction } from 'express'

const utils = require('../lib/utils')
const security = require('../lib/insecurity')

module.exports = function retrieveUserList () {
  return (req: Request, res: Response, next: NextFunction) => {
    models.User.findAll().then(users => {
      const usersWithLoginStatus = utils.queryResultToJson(users)
      usersWithLoginStatus.data.forEach(user => {
        user.token = security.authenticatedUsers.tokenOf(user)
        user.password = user.password ? user.password.replace(/./g, '*') : null
        user.totpSecret = user.totpSecret ? user.totpSecret.replace(/./g, '*') : null
      })
      res.json(usersWithLoginStatus)
    }).catch((error: Error) => {
      next(error)
    })
  }
}
