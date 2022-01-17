/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import { Request, Response, NextFunction } from 'express'

module.exports.addMemory = function addMemory () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const record = {
      caption: req.body.caption,
      imagePath: 'assets/public/images/uploads/' + req.file.filename,
      UserId: req.body.UserId
    }
    const memory = await models.Memory.create(record)
    res.status(200).json({ status: 'success', data: memory })
  }
}

module.exports.getMemories = function getMemories () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const memories = await models.Memory.findAll({ include: [models.User] })
    res.status(200).json({ status: 'success', data: memories })
  }
}
