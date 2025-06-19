import { QueryTypes } from 'sequelize'; // Dodaj na górze pliku, jeśli jeszcze nie ma

export function searchProducts () {
  return (req: Request, res: Response, next: NextFunction) => {
    let criteria: any = req.query.q === 'undefined' ? '' : req.query.q ?? ''
    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)
    // Używamy replacements, a nie konkatenacji!
    models.sequelize.query(
      "SELECT * FROM Products WHERE ((name LIKE :criteria OR description LIKE :criteria) AND deletedAt IS NULL) ORDER BY name",
      {
        replacements: { criteria: `%${criteria}%` },
        type: QueryTypes.SELECT
      }
    )
      .then((products: any) => {
        for (let i = 0; i < products.length; i++) {
          products[i].name = req.__(products[i].name)
          products[i].description = req.__(products[i].description)
        }
        res.json(utils.queryResultToJson(products))
      }).catch((error: ErrorWithParent) => {
        next(error.parent)
      })
  }
}
