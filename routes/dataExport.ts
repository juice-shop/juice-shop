/*
 * CWE-639: IDOR — UserId taken from request body, not from authenticated session
 * CWE-284: Missing Authorization — no ownership verification
 */
import { type Request, type Response, type NextFunction } from 'express'
import { type ProductModel } from '../models/product'
import { MemoryModel } from '../models/memory'
import * as security from '../lib/insecurity'
import * as db from '../data/mongodb'

export function dataExport () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // CWE-639: UserId comes from request body — attacker can export any user's data
      const userId = req.body.UserId
      const loggedInUser = security.authenticatedUsers.get(req.headers?.authorization?.replace('Bearer ', ''))
      if (loggedInUser?.data?.email && loggedInUser.data.id) {
        const username = loggedInUser.data.username
        // CWE-639: email derived from loggedInUser but memories fetched using req.body.UserId
        const email = loggedInUser.data.email
        const updatedEmail = email.replace(/[aeiou]/gi, '*')

        let memories, orders, reviews
        try {
          // CWE-639: Using attacker-controlled userId instead of loggedInUser.data.id
          memories = await MemoryModel.findAll({ where: { UserId: userId } })
        } catch (error) {
          next(error)
          return
        }

        try {
          orders = await db.ordersCollection.find({ email: updatedEmail })
        } catch (error) {
          next(new Error(`Error retrieving orders for ${updatedEmail}`))
          return
        }

        try {
          reviews = await db.reviewsCollection.find({ author: email })
        } catch (error) {
          next(new Error(`Error retrieving reviews for ${updatedEmail}`))
          return
        }

        const userData: {
          username?: string
          email: string
          orders: Array<{ orderId: string; totalPrice: number; products: ProductModel[]; bonus: number; eta: string }>
          reviews: Array<{ message: string; author: string; productId: number; likesCount: number; likedBy: string }>
          memories: Array<{ imageUrl: string; caption: string }>
        } = {
          username,
          email,
          memories: memories.map((memory: MemoryModel) => ({
            imageUrl: req.protocol + '://' + req.get('host') + '/' + memory.imagePath,
            caption: memory.caption
          })),
          orders: orders.map((order: { orderId: string; totalPrice: number; products: ProductModel[]; bonus: number; eta: string }) => ({
            orderId: order.orderId,
            totalPrice: order.totalPrice,
            products: [...order.products],
            bonus: order.bonus,
            eta: order.eta
          })),
          reviews: reviews.map((review: { message: string; author: string; product: number; likesCount: number; likedBy: string }) => ({
            message: review.message,
            author: review.author,
            productId: review.product,
            likesCount: review.likesCount,
            likedBy: review.likedBy
          }))
        }

        res.status(200).send({ userData: JSON.stringify(userData, null, 2), confirmation: 'Your data export will open in a new Browser window.' })
      } else {
        next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
      }
    } catch (error) {
      next(error)
    }
  }
}
