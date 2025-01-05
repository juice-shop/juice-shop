/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
// First, let's add the necessary type definitions


import { type Request, type Response } from 'express';
import { reviewsCollection } from '../data/mongodb';
import * as utils from '../lib/utils';
const security = require('../lib/insecurity');

module.exports = function productReviews() {
  return async (req: Request, res: Response) => {
    const user = security.authenticatedUsers.from(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      if (req.method === 'POST') {
        if (!req.body.message || typeof req.body.message !== 'string') {
          return res.status(400).json({ error: 'Invalid or missing message' });
        }

        const review = {
          product: req.params.id,
          message: req.body.message,
          author: user.data.email, 
          likesCount: 0,
          likedBy: []
        };

        await reviewsCollection.insert(review);
        return res.status(201).json({ status: 'success' });
      }

      if (req.method === 'PUT') {
        if (!req.body.id || typeof req.body.id !== 'string') {
          return res.status(400).json({ error: 'Invalid or missing review ID' });
        }
        if (!req.body.message || typeof req.body.message !== 'string') {
          return res.status(400).json({ error: 'Invalid or missing message' });
        }

        const review = await reviewsCollection.findOne({ _id: req.body.id });
        if (!review) {
          return res.status(404).json({ error: 'Review not found' });
        }
        if (review.author !== user.data.email) {
          return res.status(403).json({ error: 'Not authorized to modify this review' });
        }

        const result = await reviewsCollection.update(
          { _id: req.body.id, author: user.data.email },
          { $set: { message: req.body.message } }
        );

        if (result.modified === 0) {
          return res.status(500).json({ error: 'Failed to update the review' });
        }

        return res.json({ status: 'success' });
      }

      return res.status(405).json({ error: `Method ${req.method} is not allowed on this endpoint` });
    } catch (err: unknown) {
      return res.status(500).json(utils.getErrorMessage(err));
    }
  };
};
