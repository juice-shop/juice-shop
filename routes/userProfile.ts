/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs = require('fs')
import { type Request, type Response, type NextFunction } from 'express'
import { challenges } from '../data/datacache'

import { UserModel } from '../models/user'
import challengeUtils = require('../lib/challengeUtils')
import config from 'config'
import * as utils from '../lib/utils'
import { AllHtmlEntities as Entities } from 'html-entities'
const security = require('../lib/insecurity')
const pug = require('pug')
const themes = require('../views/themes/themes').themes
const entities = new Entities()

module.exports = function getUserProfile () {
  return (req: Request, res: Response, next: NextFunction) => {
    fs.readFile('views/userProfile.pug', function (err, buf) {
      if (err != null) throw err
      const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        UserModel.findByPk(loggedInUser.data.id).then((user: UserModel | null) => {
          let template = buf.toString()
          let username = user?.username
          if (username?.match(/#{(.*)}/) !== null && utils.isChallengeEnabled(challenges.usernameXssChallenge)) {
            req.app.locals.abused_ssti_bug = true
            const code = username?.substring(2, username.length - 1)
            try {
              if (!code) {
                throw new Error('Username is null')
              }
              username = eval(code) // eslint-disable-line no-eval
            } catch (err) {
              username = '\\' + username
            }
          } else {
            username = '\\' + username
          }
          const theme = themes[config.get<string>('application.theme')]
          if (username) {
            template = template.replace(/_username_/g, username)
          }
          template = template.replace(/_emailHash_/g, security.hash(user?.email))
          template = template.replace(/_title_/g, entities.encode(config.get<string>('application.name')))
          template = template.replace(/_favicon_/g, favicon())
          template = template.replace(/_bgColor_/g, theme.bgColor)
          template = template.replace(/_textColor_/g, theme.textColor)
          template = template.replace(/_navColor_/g, theme.navColor)
          template = template.replace(/_primLight_/g, theme.primLight)
          template = template.replace(/_primDark_/g, theme.primDark)
          template = template.replace(/_logo_/g, utils.extractFilename(config.get('application.logo')))
          const fn = pug.compile(template)
          const CSP = `img-src 'self' ${user?.profileImage}; script-src 'self' 'unsafe-eval' https://code.getmdl.io http://ajax.googleapis.com`
          // @ts-expect-error FIXME type issue with string vs. undefined for username
          challengeUtils.solveIf(challenges.usernameXssChallenge, () => { return user?.profileImage.match(/;[ ]*script-src(.)*'unsafe-inline'/g) !== null && utils.contains(username, '<script>alert(`xss`)</script>') })

          res.set({
            'Content-Security-Policy': CSP
          })

          res.send(fn(user))
        }).catch((error: Error) => {
          next(error)
        })
      } else {
        next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
      }
    })
  }

  function favicon () {
    return utils.extractFilename(config.get('application.favicon'))
  }
}
