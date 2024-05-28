/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { RecycleModel } from '../models/recycle'

import * as utils from '../lib/utils'
import {sanitizeInput} from '../lib/utils'


exports.getRecycleItem = () => (req: Request, res: Response) => {
  const santInput = sanitizeInput(req.params.id)
  RecycleModel.findAll({
    where: {
      id: JSON.parse(santInput)
    }
  }).then((Recycle) => {
    //return res.send(utils.queryResultToJson(Recycle))
  }).catch((_: unknown) => {
    //return res.send('Error fetching recycled items. Please try again')
  })
}

exports.blockRecycleItems = () => (req: Request, res: Response) => {
  const errMsg = { err: 'Sorry, this endpoint is not supported.' }
  return res.send(utils.queryResultToJson(errMsg))
}
