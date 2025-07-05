/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

import { ordersCollection } from '../data/mongodb'
import * as security from '../lib/insecurity'

export function orderHistory () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const loggedInUser = security.authenticatedUsers.get(req.headers?.authorization?.replace('Bearer ', ''))
    if (loggedInUser?.data?.email && loggedInUser.data.id) {
      const email = loggedInUser.data.email
      const updatedEmail = email.replace(/[aeiou]/gi, '*')
      const order = await ordersCollection.find({ email: updatedEmail })
      res.status(200).json({ status: 'success', data: order })
    } else {
      next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
    }
  }
}

export function allOrders () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const order = await ordersCollection.find()
    res.status(200).json({ status: 'success', data: order.reverse() })
  }
}

export function toggleDeliveryStatus () {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Authentication: check bearer token
    const authHeader = req.headers?.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: Missing authentication token.' })
    }
    const userSession = security.authenticatedUsers.get(authHeader.replace('Bearer ', ''))
    if (!userSession || !userSession.data || !userSession.data.email || !userSession.data.id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden: Invalid or expired token.' })
    }
    // Check if user is admin, or only allow updates to their own orders
    const isAdmin = userSession.data.role === 'admin' // assuming role field for admin
    let userEmail = userSession.data.email
    const orderId = req.params.id
    // Fetch the order first
    const order = await ordersCollection.findOne({ _id: orderId })
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found.' })
    }
    // Masked email as in orderHistory
    userEmail = userEmail.replace(/[aeiou]/gi, '*')
    if (!isAdmin && order.email !== userEmail) {
      return res.status(403).json({ status: 'error', message: 'Forbidden: You are not allowed to update this order.' })
    }
    const deliveryStatus = !req.body.deliveryStatus
    const eta = deliveryStatus ? '0' : '1'
    await ordersCollection.update({ _id: orderId }, { $set: { delivered: deliveryStatus, eta } })
    res.status(200).json({ status: 'success' })
  }
}
