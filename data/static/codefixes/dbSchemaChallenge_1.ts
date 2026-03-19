import { Request, Response, NextFunction } from 'express'
import { QueryTypes } from 'sequelize'

export function searchProducts() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let criteria = req.query.q === 'undefined' ? '' : String(req.query.q ?? '')
      criteria = criteria.length <= 200 ? criteria : criteria.substring(0, 200)

      const likeCriteria = `%${criteria}%`

      const products = await models.sequelize.query(
        `
          SELECT *
          FROM Products
          WHERE (
            (name LIKE :criteria OR description LIKE :criteria)
            AND deletedAt IS NULL
          )
          ORDER BY name
        `,
        {
          replacements: { criteria: likeCriteria },
          type: QueryTypes.SELECT
        }
      )

      for (let i = 0; i < products.length; i++) {
        products[i].name = req.__(products[i].name)
        products[i].description = req.__(products[i].description)
      }

      res.json(utils.queryResultToJson(products))
    } catch (error: any) {
      next(error.parent ?? error)
    }
  }
}