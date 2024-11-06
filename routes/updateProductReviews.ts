/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import challengeUtils = require('../lib/challengeUtils')
import { type Request, type Response, type NextFunction } from 'express'
import * as db from '../data/mongodb'
import { challenges } from '../data/datacache'

const security = require('../lib/insecurity')

// vuln-code-snippet start noSqlReviewsChallenge forgedReviewChallenge
module.exports = function productReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = security.authenticatedUsers.from(req) // vuln-code-snippet vuln-line forgedReviewChallenge
    // check if user is authenticated prevents anon review changes
    if (!user || !user.data.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // grab the id if the review to be updated
    const reviewId = req.body.id

    // Define a type for the review if not one already
    interface Review {
      _id: string;
      author: string;
      message: string;
    }

    db.reviewsCollection.findOne({ _id: reviewId })
      .then((review: Review | null) => {
        if (!review || typeof review.author !== 'string' || review.author !== user.data.email) {
          // user is not authorized to edit review
          return res.status(403).json({ error: 'Forbidden' });
        }

        // at this point OK to update review
        return db.reviewsCollection.update( // vuln-code-snippet neutral-line forgedReviewChallenge
          { _id: req.body.id, author: user.data.email }, // vuln-code-snippet vuln-line noSqlReviewsChallenge forgedReviewChallenge
          // Only allow message update, do not allow author to be changed
          { $set: { message: req.body.message, author: user.data.email } },
          { multi: false } // vuln-code-snippet vuln-line noSqlReviewsChallenge
        ).then((result: { modified: number, original: Array<{ author: string }> }) => {
          if (!result.original || result.original.length === 0) {
            return res.status(500).json({ error: 'Failed to retrieve the original review' });
          }
          challengeUtils.solveIf(challenges.noSqlReviewsChallenge, () => { return result.modified > 1 }); // vuln-code-snippet hide-line
          challengeUtils.solveIf(challenges.forgedReviewChallenge, () => { return user?.data && review.author !== user.data.email && result.modified == 1});
        
        res.json(result);
      });
    })
    .catch((err: Error) => {
      // Handle other potential errors like connection issues
      console.error('Error fetching review:', err);
      res.status(500).json({ error: 'Failed to fetch review' });
    });
  } 
}
// vuln-code-snippet end noSqlReviewsChallenge forgedReviewChallenge

