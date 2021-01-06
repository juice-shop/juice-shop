/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const models = require('../models/index')

module.exports.addMemory = function addMemory () {
  return async (req, res, next) => {
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
  return async (req, res, next) => {
    const memories = await models.Memory.findAll({ include: [models.User] })
    res.status(200).json({ status: 'success', data: memories })
  }
}
