/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { WalletModel } from '../models/wallet'
import { CardModel } from '../models/card'
import {sanitizeInput} from '../lib/utils'

module.exports.getWalletBalance = function getWalletBalance () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const santizitedID = sanitizeInput(req.body.UserId)
    const wallet = await WalletModel.findOne({ where: { UserId: santizitedID as string | number  } })
    if (wallet != null) {
      res.status(200).json({ status: 'success', data: wallet.balance })
    } else {
      res.status(404).json({ status: 'error' })
    }
  }
}

module.exports.addWalletBalance = function addWalletBalance () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const cardId = sanitizeInput(req.body.paymentId)
    const santiziedBodyid = sanitizeInput(req.body.UserId)
    const card = cardId ? await CardModel.findOne({ where: { id: cardId, UserId: santiziedBodyid as string | number} }) : null
    if (card != null) {
      WalletModel.increment({ balance: req.body.balance }, { where: { UserId: req.body.UserId } }).then(() => {
        res.status(200).json({ status: 'success', data: req.body.balance })
      }).catch(() => {
        res.status(404).json({ status: 'error' })
      })
    } else {
      res.status(402).json({ status: 'error', message: 'Payment not accepted.' })
    }
  }
}
