/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import type { Express } from 'express'
import type { Sequelize } from 'sequelize'
import { createApp } from '../../../server'

export async function createTestApp (): Promise<{ app: Express, sequelize: Sequelize }> {
  return await createApp({ inMemoryDb: true })
}
