import { type Request, type Response, type NextFunction } from 'express'
import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'
import { type Review } from '../data/types'
import * as db from '../data/mongodb'
import { ObjectId } from 'mongodb'

const sleep = async (ms: number) => await new Promise(resolve => setTimeout(resolve, ms))

export function likeProductReviews () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const rawId = req.body.id
    const user = security.authenticatedUsers.from(req)

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    let id: ObjectId
    try {
      id = new ObjectId(rawId)
    } catch {
      return res.status(400).json({ error: 'Invalid ID format' })
    }

    try {
      const review = await db.reviewsCollection.findOne({ _id: id })
      if (!review) {
        return res.status(404).json({ error: 'Not found' })
      }

      const likedBy = review.likedBy
      if (likedBy.includes(user.data.email)) {
        return res.status(403).json({ error: 'Not allowed' })
      }

      await db.reviewsCollection.updateOne(
        { _id: id },
        { $inc: { likesCount: 1 } }
      )

      // Artificial wait for timing attack challenge
      await sleep(150)

      const updatedReview: Review = await db.reviewsCollection.findOne({ _id: id })
      const updatedLikedBy = updatedReview.likedBy
      updatedLikedBy.push(user.data.email)

      const count = updatedLikedBy.filter(email => email === user.data.email).length
      challengeUtils.solveIf(challenges.timingAttackChallenge, () => count > 2)

      const result = await db.reviewsCollection.updateOne(
        { _id: id },
        { $set: { likedBy: updatedLikedBy } }
      )
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: 'Server error', details: err })
    }
  }
}
