/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')
const security = require('../lib/insecurity')

module.exports = function productReviews () {
  return (req, res, next) => {
    const id = req.body.id
    const user = security.authenticatedUsers.from(req)
    db.reviews.findOne({ _id: id }).then(review => {
      const likedBy = review.likedBy
      if (!likedBy.includes(user.data.email)) {
        db.reviews.update(
          { _id: id },
          { $inc: { likesCount: 1 } }
        ).then(
          result => {
            // Artificial wait for timing attack challenge
            setTimeout(function () {
              db.reviews.findOne({ _id: id }).then(review => {
                const likedBy = review.likedBy
                likedBy.push(user.data.email)
                let count = 0
                for (let i = 0; i < likedBy.length; i++) {
                  if (likedBy[i] === user.data.email) {
                    count++
                  }
                }
                utils.solveIf(challenges.timingAttackChallenge, () => { return count > 2 })
                db.reviews.update(
                  { _id: id },
                  { $set: { likedBy: likedBy } }
                ).then(
                  result => {
                    res.json(result)
                  }, err => {
                    res.status(500).json(err)
                  })
              }, () => {
                res.status(400).json({ error: 'Wrong Params' })
              })
            }, 150)
          }, err => {
            res.status(500).json(err)
          })
      } else {
        res.status(403).json({ error: 'Not allowed' })
      }
    }, () => {
      res.status(400).json({ error: 'Wrong Params' })
    })
  }
}
