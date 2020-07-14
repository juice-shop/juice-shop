/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const models = require('../models/index')
const insecurity = require('../lib/insecurity')

module.exports.getDeliveryMethods = function getDeliveryMethods () {
  return async (req, res, next) => {
    const methods = await models.Delivery.findAll()
    if (methods) {
      const sendMethods = []
      for (const method of methods) {
        sendMethods.push({
          id: method.id,
          name: method.name,
          price: insecurity.isDeluxe(req) ? method.deluxePrice : method.price,
          eta: method.eta,
          icon: method.icon
        })
      }
      res.status(200).json({ status: 'success', data: sendMethods })
    } else {
      res.status(400).json({ status: 'error' })
    }
  }
}

module.exports.getDeliveryMethod = function getDeliveryMethod () {
  return async (req, res, next) => {
    const method = await models.Delivery.findOne({ where: { id: req.params.id } })
    if (method) {
      const sendMethod = {
        id: method.id,
        name: method.name,
        price: insecurity.isDeluxe(req) ? method.deluxePrice : method.price,
        eta: method.eta,
        icon: method.icon
      }
      res.status(200).json({ status: 'success', data: sendMethod })
    } else {
      res.status(400).json({ status: 'error' })
    }
  }
}
