/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import { Request, Response, NextFunction } from 'express'

module.exports.getAddress = function getAddress () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const addresses = await models.Address.findAll({ where: { UserId: req.body.UserId } })
    res.status(200).json({ status: 'success', data: addresses })
  }
}

module.exports.getAddressById = function getAddressById () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const address = await models.Address.findOne({ where: { id: req.params.id, UserId: req.body.UserId } })
    if (address) {
      res.status(200).json({ status: 'success', data: address })
    } else {
      res.status(400).json({ status: 'error', data: 'Malicious activity detected.' })
    }
  }
}

module.exports.delAddressById = function delAddressById () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const address = await models.Address.destroy({ where: { id: req.params.id, UserId: req.body.UserId } })
    if (address) {
      res.status(200).json({ status: 'success', data: 'Address deleted successfully.' })
    } else {
      res.status(400).json({ status: 'error', data: 'Malicious activity detected.' })
    }
  }
}
