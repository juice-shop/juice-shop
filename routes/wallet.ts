/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { WalletModel } from '../models/wallet'
import { CardModel } from '../models/card'

export function getWalletBalance () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const wallet = await WalletModel.findOne({ where: { UserId: req.body.UserId } })
      if (wallet != null) {
        res.status(200).json({ status: 'success', data: wallet.balance })
      } else {
        res.status(404).json({ status: 'error' })
      }
    } catch (error) {
      next(error)
    }
  }
}

export function addWalletBalance () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const cardId = req.body.paymentId
    try {
      const card = cardId ? await CardModel.findOne({ where: { id: cardId, UserId: req.body.UserId } }) : null
      if (card != null) {
        await WalletModel.increment({ balance: req.body.balance }, { where: { UserId: req.body.UserId } })
        res.status(200).json({ status: 'success', data: req.body.balance })
      } else {
        res.status(402).json({ status: 'error', message: 'Payment not accepted.' })
      }
    } catch (error) {
      res.status(404).json({ status: 'error' })
    }
  }
}
