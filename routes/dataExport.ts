/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

import * as challengeUtils from '../lib/challengeUtils'
import { type ProductModel } from '../models/product'
import { MemoryModel } from '../models/memory'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'
import * as db from '../data/mongodb'

export function dataExport () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.headers?.authorization?.replace('Bearer ', '')
    const loggedInUser = security.authenticatedUsers.get(authToken)
    if (loggedInUser?.data?.email && loggedInUser.data.id) {
      const email = loggedInUser.data.email
      const username = loggedInUser.data.username
      const updatedEmail = email.replace(/[aeiou]/gi, '*')
      const userData: {
        username?: string
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
      } = {
        username,
        email,
        orders: [],
        reviews: [],
        memories: []
      }

      const memories = await MemoryModel.findAll({ where: { UserId: req.body.UserId } })
      for (const memory of memories) {
        const hostUrl = `${req.protocol}://${req.get('host')}`
        userData.memories.push({
          imageUrl: `${hostUrl}/${memory.imagePath}`,
          caption: memory.caption
        })
      }

      db.ordersCollection.find({ email: updatedEmail }).then((orders: Array<{
        orderId: string
        totalPrice: number
        products: ProductModel[]
        bonus: number
        eta: string
      }>) => {
        for (const order of orders) {
          userData.orders.push({
            orderId: order.orderId,
            totalPrice: order.totalPrice,
            products: [...order.products],
            bonus: order.bonus,
            eta: order.eta
          })
        }

        db.reviewsCollection.find({ author: email }).then((reviews: Array<{
          message: string
          author: string
          product: number
          likesCount: number
          likedBy: string
        }>) => {
          for (const review of reviews) {
            userData.reviews.push({
              message: review.message,
              author: review.author,
              productId: review.product,
              likesCount: review.likesCount,
              likedBy: review.likedBy
            })
          }
          const emailHash = security.hash(email).slice(0, 4)
          for (const order of userData.orders) {
            const orderPrefix = order.orderId.split('-')[0]
            challengeUtils.solveIf(challenges.dataExportChallenge, () => { return orderPrefix !== emailHash })
          }
          const confirmationMessage = 'Your data export will open in a new Browser window.'
          res.status(200).send({ userData: JSON.stringify(userData, null, 2), confirmation: confirmationMessage })
        },
        () => {
          const reviewErrorMsg = `Error retrieving reviews for ${updatedEmail}`
          next(new Error(reviewErrorMsg))
        })
      },
      () => {
        const orderErrorMsg = `Error retrieving orders for ${updatedEmail}`
        next(new Error(orderErrorMsg))
      })
    } else {
      const errorMsg = `Blocked illegal activity by ${req.socket.remoteAddress}`
      next(new Error(errorMsg))
    }
  }
}
