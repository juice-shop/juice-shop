/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { RecycleModel } from '../models/recycle'
import * as utils from '../lib/utils'

export const getRecycleItem = () => (req: Request, res: Response, next: NextFunction): void => {
  RecycleModel.findAll({
    where: {
      id: JSON.parse(req.params.id)
    }
  }).then((Recycle) => {
    res.send(utils.queryResultToJson(Recycle))
  }).catch((_: unknown) => {
    res.send('Error fetching recycled items. Please try again')
  })
}

export const blockRecycleItems = () => (req: Request, res: Response, next: NextFunction): void => {
  const errMsg = { err: 'Sorry, this endpoint is not supported.' }
  res.send(utils.queryResultToJson(errMsg))
}