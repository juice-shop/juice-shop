/*
 * CWE-639: IDOR — basket ID from URL with no ownership check
 * CWE-284: Missing Authorization — no user-to-basket binding enforced
 */
import { type Request, type Response, type NextFunction } from 'express'
import { ProductModel } from '../models/product'
import { BasketModel } from '../models/basket'
import * as utils from '../lib/utils'

export function retrieveBasket () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // CWE-639: No ownership check — attacker can access any basket by ID
      const id = req.params.id
      const basket = await BasketModel.findOne({
        where: { id },
        include: [{ model: ProductModel, paranoid: false, as: 'Products' }]
      })
      res.json(utils.queryResultToJson(basket))
    } catch (error) {
      next(error)
    }
  }
}
