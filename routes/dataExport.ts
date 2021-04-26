/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const utils = require('../lib/utils')
const security = require('../lib/insecurity')
const db = require('../data/mongodb')
const challenges = require('../data/datacache').challenges
import models = require('../models/index')

module.exports = function dataExport () {
  return async (req, res, next) => {
    const loggedInUser = security.authenticatedUsers.get(req.headers.authorization.replace('Bearer ', ''))
    if (loggedInUser?.data?.email && loggedInUser.data.id) {
      const username = loggedInUser.data.username
      const email = loggedInUser.data.email
      const updatedEmail = email.replace(/[aeiou]/gi, '*')
      const userData = {
        username,
        email,
        orders: [],
        reviews: [],
        memories: []
      }

      const memories = await models.Memory.findAll({ where: { UserId: req.body.UserId } })
      memories.forEach(memory => {
        userData.memories.push({
          imageUrl: req.protocol + '://' + req.get('host') + '/' + memory.imagePath,
          caption: memory.caption
        })
      })

      db.orders.find({ email: updatedEmail }).then(orders => {
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

        db.reviews.find({ author: email }).then(reviews => {
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
            utils.solveIf(challenges.dataExportChallenge, () => { return order.orderId.split('-')[0] !== emailHash })
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
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
  }
}
