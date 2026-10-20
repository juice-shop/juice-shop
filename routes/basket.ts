import { type Request, type Response, type NextFunction } from 'express'
import { ProductModel } from '../models/product'
import { BasketModel } from '../models/basket'
import * as challengeUtils from '../lib/challengeUtils'

import * as utils from '../lib/utils'
import * as security from '../lib/insecurity'
import { challenges } from '../data/datacache'

export function retrieveBasket () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id)
      const user = security.authenticatedUsers.from(req)

      // Перевіряємо автентифікацію користувача
      if (!user?.data?.id) {
        return res.status(401).json({
          error: 'Authentication required'
        })
      }

      // Перевіряємо коректність ідентифікатора кошика
      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
          error: 'Invalid basket ID'
        })
      }

      // Навчальна перевірка Juice Shop
      challengeUtils.solveIf(challenges.basketAccessChallenge, () => {
        return Boolean(user.bid && user.bid !== id)
      })

      // Шукаємо кошик за ID та ID його власника
      const basket = await BasketModel.findOne({
        where: {
          id,
          UserId: user.data.id
        },
        include: [
          {
            model: ProductModel,
            paranoid: false,
            as: 'Products'
          }
        ]
      })

      // Якщо кошик не знайдено серед кошиків цього користувача
      if (!basket) {
        return res.status(404).json({
          error: 'Basket not found or access denied'
        })
      }

      // Перекладаємо назви товарів
      if (basket.Products != null && basket.Products.length > 0) {
        for (let i = 0; i < basket.Products.length; i++) {
          basket.Products[i].name = req.__(basket.Products[i].name)
        }
      }

      // Повертаємо дані тільки після перевірки доступу
      return res.json(utils.queryResultToJson(basket))
    } catch (error) {
      next(error)
    }
  }
}
