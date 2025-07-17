/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { ChallengeModel } from '../models/challenge'

export function updateHintState () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { challengeKey, hintState } = req.body
      if (!challengeKey || hintState === undefined) {
        return res.status(400).json({ status: 'error', error: 'Invalid request body' })
      }

      const challenge = await ChallengeModel.findOne({ where: { key: challengeKey } })
      if (!challenge) {
        return res.status(404).json({ status: 'error', error: 'Challenge not found' })
      }

      // Only update if the new state is greater than the current one
      if (challenge.hintState < hintState) {
        await challenge.update({ hintState })
      }

      res.status(200).json({ status: 'success', data: challenge })
    } catch (error) {
      next(error)
    }
  }
}
