/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { RecycleModel } from '../models/recycle'

import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import * as utils from '../lib/utils'

export const getRecycleItem = () => (req: Request, res: Response) => {
  RecycleModel.findAll({
    where: {
      id: JSON.parse(req.params.id)
    }
  }).then((Recycle) => {
    return res.send(utils.queryResultToJson(Recycle))
  }).catch((_: unknown) => {
    return res.send('Error fetching recycled items. Please try again')
  })
}

export const blockRecycleItems = () => (req: Request, res: Response) => {
  const errMsg = { err: 'Sorry, this endpoint is not supported.' }
  return res.send(utils.queryResultToJson(errMsg))
}

export const validateRecycleOrderId = () => (req: Request, res: Response) => {
  const orderId = req.query.orderId as string

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' })
  }

  const orderIdFormat = /^([0-9a-f]+(-[0-9a-f]*)?)+$/

  const start = Date.now()
  const isValid = orderIdFormat.test(orderId)
  const duration = Date.now() - start

  challengeUtils.solveIf(challenges.redosChallenge, () => { return duration > 2000 })

  return res.json({ valid: isValid })
}
