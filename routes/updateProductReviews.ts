/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import challengeUtils = require('../lib/challengeUtils')
import { type Request, type Response, type NextFunction } from 'express'
import * as db from '../data/mongodb'
import { challenges } from '../data/datacache'
import jwt from 'jsonwebtoken'

const security = require('../lib/insecurity')

// vuln-code-snippet start noSqlReviewsChallenge forgedReviewChallenge
module.exports = function productReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1] // vuln-code-snippet vuln-line forgedReviewChallenge
    // check if user is authenticated prevents anon review changes
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, 'your-secret-key'); // Ensure the token is valid using your secret key
      const user = security.authenticatedUsers.get(token); // Retrieve the user based on the token

      if (!user || user.data.email !== decoded.email) {
        return res.status(403).json({ error: 'Forbidden' }); // Check if the user matches the decoded token
      }

      // grab the id if the review to be updated
      const reviewId = req.body.id
      const reviewMessage = req.body.message;

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
            { _id: reviewId, author: user.data.email }, // vuln-code-snippet vuln-line noSqlReviewsChallenge forgedReviewChallenge
            // Only allow message update, do not allow author to be changed
            { $set: { message: reviewMessage, author: user.data.email } },
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
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token or unauthorized' }); // Token is invalid or expired
    }
  }; 
};
// vuln-code-snippet end noSqlReviewsChallenge forgedReviewChallenge

