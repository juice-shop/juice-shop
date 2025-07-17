/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { HintUsageModel } from '../models/hintUsage'
import { ChallengeModel } from '../models/challenge'
import * as security from '../lib/insecurity'

export function recordHintUsage () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = security.authenticatedUsers.from(req)
      if (!user) {
        return res.status(401).json({ status: 'error', error: 'Unauthorized' })
      }

      const { challengeKey, hintState } = req.body
      if (!challengeKey || !hintState) {
        return res.status(400).json({ status: 'error', error: 'Invalid request body' })
      }

      const challenge = await ChallengeModel.findOne({ where: { key: challengeKey } })
      if (!challenge) {
        return res.status(404).json({ status: 'error', error: 'Challenge not found' })
      }

      const [hintUsage, created] = await HintUsageModel.findOrCreate({
        where: {
          UserId: user.data.id,
          ChallengeId: challenge.id
        },
        defaults: {
          UserId: user.data.id,
          ChallengeId: challenge.id,
          hintState
        }
      })

      if (!created && hintUsage.hintState < hintState) {
        // If the record already exists, update the state only if it's a "higher" state (e.g., from 1 to 2)
        await hintUsage.update({ hintState })
      }

      res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  }
}
