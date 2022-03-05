/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import Hashids = require('hashids/cjs')
import { Request, Response } from 'express'
import {ChallengeModel} from '../models/challenge'

const sequelize = require('sequelize')
const challenges = require('../data/datacache').challenges
const Op = sequelize.Op

module.exports.continueCode = function continueCode () {
  const hashids = new Hashids('this is my salt', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
  return (req: Request, res: Response) => {
    const ids = []
    for (const name in challenges) {
      if (Object.prototype.hasOwnProperty.call(challenges, name)) {
        if (challenges[name].solved) ids.push(challenges[name].id)
      }
    }
    const continueCode = ids.length > 0 ? hashids.encode(ids) : undefined
    res.json({ continueCode })
  }
}

module.exports.continueCodeFindIt = function continueCodeFindIt () {
  const hashids = new Hashids('this is the salt for findIt challenges', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
  return async (req: Request, res: Response) => {
    const ids = []
    const challenges = await ChallengeModel.findAll({ where: { codingChallengeStatus: { [Op.gte]: 1 } } })
    for (const challenge of challenges) {
      ids.push(challenge.id)
    }
    const continueCode = ids.length > 0 ? hashids.encode(ids) : undefined
    res.json({ continueCode })
  }
}

module.exports.continueCodeFixIt = function continueCodeFixIt () {
  const hashids = new Hashids('yet another salt for the fixIt challenges', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
  return async (req: Request, res: Response) => {
    const ids = []
    const challenges = await ChallengeModel.findAll({ where: { codingChallengeStatus: { [Op.gte]: 2 } } })
    for (const challenge of challenges) {
      ids.push(challenge.id)
    }
    const continueCode = ids.length > 0 ? hashids.encode(ids) : undefined
    res.json({ continueCode })
  }
}
