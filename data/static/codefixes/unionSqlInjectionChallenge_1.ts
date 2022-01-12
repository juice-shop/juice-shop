module.exports = function searchProducts () {
  return (req, res, next) => {
    let criteria: any = req.query.q === 'undefined' ? '' : req.query.q || ''
    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)
    criteria.replace(/"|'|;|and|or/i, "")
    models.sequelize.query(`SELECT * FROM Products WHERE ((name LIKE '%${criteria}%' OR description LIKE '%${criteria}%') AND deletedAt IS NULL) ORDER BY name`)
      .then(([products]) => {
        const dataString = JSON.stringify(products)
        for (let i = 0; i < products.length; i++) {
          products[i].name = req.__(products[i].name)
          products[i].description = req.__(products[i].description)
        }
        res.json(utils.queryResultToJson(products))
      }).catch((error: Error) => {
        next(error)
      })
  }
}