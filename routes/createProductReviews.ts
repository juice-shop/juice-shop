/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import challengeUtils = require('../lib/challengeUtils')

import * as utils from '../lib/utils'

const reviews = require('../data/mongodb').reviews
const challenges = require('../data/datacache').challenges
const security = require('../lib/insecurity')


module.exports = function productReviews () {
  return async (req: Request, res: Response) => {
    const user = security.authenticatedUsers.from(req)
    challengeUtils.solveIf(challenges.forgedReviewChallenge, () => { return user && user.data.email !== req.body.author })

    try {
      const reviewData = {
        product: req.params.id,
        message: req.body.message,
        author: req.body.author,
        likesCount: 0,
        likedBy: []
      }

      async function insertReview() {
        return await reviews.insert(reviewData)
      }
      
      await insertReview()
      res.status(201).json({ status: 'success' })
    } catch (err) {
      res.status(500).json(utils.getErrorMessage(err))
    }
  }
}

