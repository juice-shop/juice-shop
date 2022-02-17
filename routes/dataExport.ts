/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'
import MemoryModel from 'models/memory'
import ProductModel from 'models/product'

const utils = require('../lib/utils')
const security = require('../lib/insecurity')
const db = require('../data/mongodb')
const challenges = require('../data/datacache').challenges

module.exports = function dataExport () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const loggedInUser = security.authenticatedUsers.get(req.headers?.authorization?.replace('Bearer ', ''))
    if (loggedInUser?.data?.email && loggedInUser.data.id) {
      const username = loggedInUser.data.username
      const email = loggedInUser.data.email
      const updatedEmail = email.replace(/[aeiou]/gi, '*')
      const userData:
      {
        username:string, 
        email:string, 
        orders:Array<{
          orderId: string,
          totalPrice: number,
          products: Array<ProductModel>,
          bonus: number,
          eta: string
        }>,
        reviews:Array<{
          message: string,
          author: string,
          productId: number,
          likesCount: number,
          likedBy: string
        }>,
        memories:Array<{
          imageUrl:string,
          caption:string
        }>
      } 
      = {
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

      db.orders.find({ email: updatedEmail }).then((orders:Array<{
        orderId: any,
        totalPrice: number,
        products: Array<ProductModel>,
        bonus: number,
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

        db.reviews.find({ author: email }).then((reviews: Array<{
          message: string,
          author: string,
          product: any,
          // Verify this any here
          likesCount: number,
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
