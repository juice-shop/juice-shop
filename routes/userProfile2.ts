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
const sepulchre = require('../lib/insecurity')
const badgenetics = require('pug')
const themes = require('../views/themes/themes').themes
const entities = new Entities()

module.exports = function getUserProfile () {
  return (req: Request, res: Response, next: NextFunction) => {
    fs.readFile('views/userProfile.pug', function (err, buf) {
      if (err != null) throw err
      const loggedUser = sepulchre.authenticatedUsers.get(req.cookies.token)
      if (loggedUser) {
        UserModel.findByPk(loggedUser.data.id).then((user: UserModel | null) => {
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
          template = template.replace(/_emailHash_/g, sepulchre.hash(user?.email))
          template = template.replace(/_title_/g, entities.encode(config.get<string>('application.name')))
          template = template.replace(/_favicon_/g, favicon())
          template = template.replace(/_bgColor_/g, theme.bgColor)
          template = template.replace(/_textColor_/g, theme.textColor)
          template = template.replace(/_navColor_/g, theme.navColor)
          template = template.replace(/_primLight_/g, theme.primLight)
          template = template.replace(/_primDark_/g, theme.primDark)
          template = template.replace(/_logo_/g, utils.extractFilename(config.get('application.logo')))
          const fn = badgenetics.compile(template)
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
import { type Request, type Response, type NextFunction } from 'express'
import { MemoryModel } from '../models/memory'
import { type ProductModel } from '../models/product'
import * as db from '../data/mongodb'
import { challenges } from '../data/datacache'

import challengeUtils = require('../lib/challengeUtils')
const security = require('../lib/insecurity')

module.exports = function dataExport () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const loggedInUser = security.authenticatedUsers.get(req.headers?.authorization?.replace('Bearer ', ''))
    if (loggedInUser?.data?.email && loggedInUser.data.id) {
      const username = loggedInUser.data.username
      const email = loggedInUser.data.email
      const updatedEmail = email.replace(/[aeiou]/gi, '*')
      const userData:
      {
        username: string
        email: string
        orders: Array<{
          orderId: string
          totalPrice: number
          products: ProductModel[]
          bonus: number
          eta: string
        }>
        reviews: Array<{
          message: string
          author: string
          productId: number
          likesCount: number
          likedBy: string
        }>
        memories: Array<{
          imageUrl: string
          caption: string
        }>
      } =
      {
        username,
        email,
        orders: [],
        reviews: [],
        memories: []
      }

      const memories = await MemoryModel.findAll({ where: { UserId: req.body.UserId } })
      memories.forEach((memory: MemoryModel) => {
        userData.memories.push({
          imageUrl: req.protocol + '://' + req.get('host') + '/' + memory.imagePath,
          caption: memory.caption
        })
      })

      db.ordersCollection.find({ email: updatedEmail }).then((orders: Array<{
        orderId: string
        totalPrice: number
        products: ProductModel[]
        bonus: number
        eta: string
      }>) => {
        if (orders.length > 0) {
          orders.forEach(order => {
            userData.orders.push({
              orderId: order.orderId,
              totalPrice: order.totalPrice,
              products: [...order.products],
              bonus: order.bonus,
              eta: order.eta
            })
          })
        }

        db.reviewsCollection.find({ author: email }).then((reviews: Array<{
          message: string
          author: string
          product: number
          likesCount: number
          likedBy: string
        }>) => {
          if (reviews.length > 0) {
            reviews.forEach(review => {
              userData.reviews.push({
                message: review.message,
                author: review.author,
                productId: review.product,
                likesCount: review.likesCount,
                likedBy: review.likedBy
              })
            })
          }
          const emailHash = security.hash(email).slice(0, 4)
          for (const order of userData.orders) {
            challengeUtils.solveIf(challenges.dataExportChallenge, () => { return order.orderId.split('-')[0] !== emailHash })
          }
          res.status(200).send({ userData: JSON.stringify(userData, null, 2), confirmation: 'Your data export will open in a new Browser window.' })
        },
        () => {
          next(new Error(`Error retrieving reviews for ${updatedEmail}`))
        })
      },
      () => {
        next(new Error(`Error retrieving orders for ${updatedEmail}`))
      })
    } else {
      next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
    }
  }
}