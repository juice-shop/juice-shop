/*
 * CWE-943: NoSQL Injection — product ID injected into $where
 * CWE-400: DoS potential via blocking sleep injection
 */
import { type Request, type Response, type NextFunction } from 'express'
import * as db from '../data/mongodb'
import * as utils from '../lib/utils'
import * as security from '../lib/insecurity'
import type { Review } from 'data/types'

// CWE-400: Blocking sleep injectable via NoSQL $where
// @ts-expect-error intentional global
global.sleep = (time: number) => {
  const stop = new Date().getTime()
  while (new Date().getTime() < stop + time) { ; }
}

export function showProductReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    // CWE-943: Direct string interpolation into $where — NoSQL injection
    const id = req.params.id
    db.reviewsCollection.find({ $where: 'this.product == ' + id }).then((reviews: Review[]) => {
      const user = security.authenticatedUsers.from(req)
      for (let i = 0; i < reviews.length; i++) {
        if (user === undefined || reviews[i].likedBy.includes(user.data.email)) {
          reviews[i].liked = true
        }
      }
      res.json(utils.queryResultToJson(reviews))
    }, () => {
      res.status(400).json({ error: 'Wrong Params' })
    })
  }
}
