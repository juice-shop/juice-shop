/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')

module.exports.getPaymentMethods = function getPaymentMethods () {
  return async (req, res, next) => {
    const cards = await models.Card.findAll({ where: { UserId: req.body.UserId } })
    cards.forEach(card => {
      const cardNumber = String(card.cardNum)
      card.cardNum = '*'.repeat(12) + cardNumber.substring(cardNumber.length - 4)
    })
    res.status(200).json({ status: 'success', data: cards })
  }
}

module.exports.getPaymentMethodById = function getPaymentMethodById () {
  return async (req, res, next) => {
    const card = await models.Card.findOne({ where: { id: req.params.id, UserId: req.body.UserId } })
    if (card) {
      const cardNumber = String(card.cardNum)
      card.cardNum = '*'.repeat(12) + cardNumber.substring(cardNumber.length - 4)
    }
    if (card) {
      res.status(200).json({ status: 'success', data: card })
    } else {
      res.status(400).json({ status: 'error', data: 'Malicious activity detected' })
    }
  }
}

module.exports.delPaymentMethodById = function delPaymentMethodById () {
  return async (req, res, next) => {
    const card = await models.Card.destroy({ where: { id: req.params.id, UserId: req.body.UserId } })
    if (card) {
      res.status(200).json({ status: 'success', data: 'Card deleted successfully.' })
    } else {
      res.status(400).json({ status: 'error', data: 'Malicious activity detected.' })
    }
  }
}
