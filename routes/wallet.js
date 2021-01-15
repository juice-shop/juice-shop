/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const models = require('../models/index')

module.exports.getWalletBalance = function getWalletBalance () {
  return async (req, res, next) => {
    const wallet = await models.Wallet.findOne({ where: { UserId: req.body.UserId } })
    if (wallet) {
      res.status(200).json({ status: 'success', data: wallet.balance })
    } else {
      res.status(404).json({ status: 'error' })
    }
  }
}

module.exports.addWalletBalance = function addWalletBalance () {
  return async (req, res, next) => {
    const cardId = req.body.paymentId
    const card = cardId ? await models.Card.findOne({ where: { id: cardId, UserId: req.body.UserId } }) : null
    if (card) {
      const wallet = await models.Wallet.increment({ balance: req.body.balance }, { where: { UserId: req.body.UserId } })
      if (wallet) {
        res.status(200).json({ status: 'success', data: wallet.balance })
      } else {
        res.status(404).json({ status: 'error' })
      }
    } else {
      res.status(402).json({ status: 'error', message: 'Payment not accepted.' })
    }
  }
}
