/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')
const security = require('../lib/insecurity')

// TODO Merge with file createProductReviews.ts to create a bigger Coding Challenge snippet covering creation and updates at the same time. Alternatively support for multiple source files would be needed in Coding Challenges.

// vuln-code-snippet start noSqlReviewsChallenge forgedReviewChallenge
module.exports = function productReviews () {
  return (req, res, next) => {
    const user = security.authenticatedUsers.from(req) // vuln-code-snippet vuln-line forgedReviewChallenge
    db.reviews.update( // vuln-code-snippet neutral-line forgedReviewChallenge
      { _id: req.body.id }, // vuln-code-snippet vuln-line noSqlReviewsChallenge forgedReviewChallenge
      { $set: { message: req.body.message } },
      { multi: true } // vuln-code-snippet vuln-line noSqlReviewsChallenge
    ).then(
      result => {
        utils.solveIf(challenges.noSqlReviewsChallenge, () => { return result.modified > 1 }) // vuln-code-snippet hide-line
        utils.solveIf(challenges.forgedReviewChallenge, () => { return user?.data && result.original[0].author !== user.data.email && result.modified === 1 }) // vuln-code-snippet hide-line
        res.json(result)
      }, err => {
        res.status(500).json(err)
      })
  }
}
// vuln-code-snippet end noSqlReviewsChallenge forgedReviewChallenge
