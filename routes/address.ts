/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { AddressModel } from '../models/address'
import {sanitizeInput} from '../lib/utils'

// module.exports.getAddress = function getAddress () {
//   return async (req: Request, res: Response) => {
//     const santInput = sanitizeInput(req.body.UserId)
//     const addresses = await AddressModel.findAll({ where: { UserId: santInput as string | number } })
//     res.status(200).json({ status: 'success', data: addresses })
//   }
// }

module.exports.getAddressById = function getAddressById () {
  return async (req: Request, res: Response) => {
    const santInputId = sanitizeInput(req.params.id)
    const santInputUserid = sanitizeInput(req.body.UserId)

    const address = await AddressModel.findOne({ where: { id: santInputId as string | number , UserId: santInputUserid as string | number } })
    if (address != null) {
      res.status(200).json({ status: 'success', data: address })
    } else {
      res.status(400).json({ status: 'error', data: 'Malicious activity detected.' })
    }
  }
}

module.exports.delAddressById = function delAddressById () {
  return async (req: Request, res: Response) => {
    const santInputId = sanitizeInput(req.params.id)
    const santInputUserid = sanitizeInput(req.body.UserId)

    const address = await AddressModel.destroy({ where: { id: santInputId as string | number , UserId: santInputUserid as string | number } })
    if (address) {
      res.status(200).json({ status: 'success', data: 'Address deleted successfully.' })
    } else {
      res.status(400).json({ status: 'error', data: 'Malicious activity detected.' })
    }
  }
}
