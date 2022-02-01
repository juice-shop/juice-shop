/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import db = require('../data/mongodb')
import { Request, Response } from 'express'

const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const security = require('../lib/insecurity')

module.exports = function productReviews () {
  return (req: Request, res: Response) => {
    const user = security.authenticatedUsers.from(req)
    utils.solveIf(challenges.forgedReviewChallenge, () => { return user && user.data.email !== req.body.author })
    db.reviews.insert({
      product: req.params.id,
      message: req.body.message,
      author: req.body.author,
      likesCount: 0,
      likedBy: []
    }).then(() => {
      res.status(201).json({ staus: 'success' })
    }, err => {
      res.status(500).json(err)
    })
  }
}
