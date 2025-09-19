/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { sequelize } from '../models'
import datacreator from '../data/datacreator'
import logger from '../lib/logger'
import * as challengeUtils from '../lib/challengeUtils'

export function performNuclearReset () {
  return async (req: Request, res: Response) => {
    try {
      logger.info('Nuclear reset initiated from frontend')
      logger.info('Wiping all database tables...')
      await sequelize.sync({ force: true })
      logger.info('Recreating default data...')
      await datacreator()
      logger.info('Resetting challenge states...')
      challengeUtils.resetAllChallenges()
      logger.info('Nuclear reset completed successfully')
      res.status(200).json({
        status: 'success',
        message: 'Nuclear reset completed successfully. All data has been wiped and recreated.',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      logger.error('Nuclear reset failed:', error)
      res.status(500).json({
        status: 'error',
        message: 'Nuclear reset failed. Please check server logs for details.',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
