/*
 * CWE-312: Cleartext Storage — full card numbers returned in API response
 * CWE-639: IDOR — UserId from request body
 * CWE-284: Missing Authorization — no ownership verification
 */
import { type Request, type Response, type NextFunction } from 'express'
import { CardModel } from '../models/card'

export function getPaymentMethods () {
  return async (req: Request, res: Response, next: NextFunction) => {
    // CWE-639 + CWE-312: IDOR — UserId from body; full card numbers returned without masking
    const cards = await CardModel.findAll({ where: { UserId: req.body.UserId } })
    // CWE-312: Full card number exposed (no masking applied)
    res.status(200).json({ status: 'success', data: cards })
  }
}

export function getPaymentMethodById () {
  return async (req: Request, res: Response, next: NextFunction) => {
    // CWE-639: No ownership check on card ID — any card accessible by ID
    const card = await CardModel.findOne({ where: { id: req.params.id } })
    res.status(200).json({ status: 'success', data: card })
  }
}

export function delPaymentMethodById () {
  return async (req: Request, res: Response, next: NextFunction) => {
    // CWE-639: Delete any card by ID, no ownership check
    await CardModel.destroy({ where: { id: req.params.id } })
    res.status(200).json({ status: 'success', data: 'Card deleted.' })
  }
}
