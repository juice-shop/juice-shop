/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import Hashids = require('hashids/cjs')
import models = require('../models/index')
const sequelize = require('sequelize')
const challenges = require('../data/datacache').challenges
const Op = sequelize.Op

module.exports.continueCode = function continueCode () {
  const hashids = new Hashids('this is my salt', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
  return (req, res) => {
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
  return async (req, res) => {
    const ids = []
    const challenges = await models.Challenge.findAll({ where: { codingChallengeStatus: { [Op.gte]: 1 } } })
    for (const challenge of challenges) {
      ids.push(challenge.dataValues.id)
    }
    const continueCode = ids.length > 0 ? hashids.encode(ids) : undefined
    res.json({ continueCode })
  }
}

module.exports.continueCodeFixIt = function continueCodeFixIt () {
  const hashids = new Hashids('yet another salt for the fixIt challenges', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
  return async (req, res) => {
    const ids = []
    const challenges = await models.Challenge.findAll({ where: { codingChallengeStatus: { [Op.gte]: 2 } } })
    for (const challenge of challenges) {
      ids.push(challenge.dataValues.id)
    }
    const continueCode = ids.length > 0 ? hashids.encode(ids) : undefined
    res.json({ continueCode })
  }
}
