/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

process.env.NODE_ENV = 'test'

import type { Express } from 'express'
import type { Sequelize } from 'sequelize'

export async function createTestApp (): Promise<{ app: Express, sequelize: Sequelize }> {
  const { createApp } = await import('../../../server')
  return await createApp({ inMemoryDb: true })
}
