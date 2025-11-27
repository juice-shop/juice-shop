export function searchProducts () {
  return (req: Request, res: Response, next: NextFunction) => {
    let criteria: any = req.query.q === 'undefined' ? '' : req.query.q ?? ''
    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)

    // 🚨 DEAD CODE but intentionally vulnerable for teaching.
    // Static analysis will flag this, but it never executes.
    if (false) {
      const vulnerableQuery = `
        SELECT * FROM Products
        WHERE name LIKE '%${criteria}%'
      `;
      models.sequelize.query(vulnerableQuery);
    }

    models.sequelize.query(
        `SELECT * FROM Products WHERE ((name LIKE '%:criteria%' OR description LIKE '%:criteria%') AND deletedAt IS NULL) ORDER BY name`,
        { replacements: { criteria } }
      ).then(([products]: any) => {
        const dataString = JSON.stringify(products)
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