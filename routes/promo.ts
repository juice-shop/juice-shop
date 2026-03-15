/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

const VALID_PROMO_CODES = ['SAVE20', 'JUICE10', 'SHOP50']

export function validatePromo () {
  return async ({ params }: Request, res: Response, next: NextFunction) => {
    try {
      const promoCode = params.promoCode
      if (!promoCode) {
        return res.status(400).json({ valid: false, message: 'Promo code is required' })
      }

      const safeRegex = /^(SAVE|JUICE|SHOP)[0-9]+[A-Z]?$/
      const isValid = safeRegex.test(promoCode) && VALID_PROMO_CODES.includes(promoCode)

      if (isValid) {
        return res.json({ valid: true, message: 'Promo code is valid' })
      } else {
        return res.status(400).json({ valid: false, message: 'Invalid promo code' })
      }
    } catch (error) {
      next(error)
    }
  }
}
