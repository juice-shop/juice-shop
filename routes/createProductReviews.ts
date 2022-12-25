/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response } from 'express'
import challengeUtils = require('../lib/challengeUtils')

const reviews = require('../data/mongodb').reviews

const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const security = require('../lib/insecurity')

module.exports = function productReviews () {
  return (req: Request, res: Response) => {
    const user = security.authenticatedUsers.from(req)
    challengeUtils.solveIf(challenges.forgedReviewChallenge, () => { return user && user.data.email !== req.body.author })
    reviews.insert({
      product: req.params.id,
      message: req.body.message,
      author: req.body.author,
      likesCount: 0,
      likedBy: []
    }).then(() => {
      res.status(201).json({ status: 'success' })
    }, (err: unknown) => {
      res.status(500).json(utils.get(err))
    })
  }
}
