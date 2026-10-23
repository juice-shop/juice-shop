/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

import { loadStaticTagGroupsData } from '../data/staticData'

export function getTagGroups () {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const tagGroups = await loadStaticTagGroupsData()
      res.json(tagGroups)
    } catch (err) {
      next(err)
    }
  }
}
