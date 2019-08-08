const utils = require('../lib/utils')
const models = require('../models/index')
const challenges = require('../data/datacache').challenges

module.exports = function searchProducts () {
  return ({ query }, res, next) => {
    let criteria = query.q === 'undefined' ? '' : query.q || ''
    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)
    models.sequelize.query('SELECT * FROM Products WHERE ((name LIKE \'%' + criteria + '%\' OR description LIKE \'%' + criteria + '%\') AND deletedAt IS NULL) ORDER BY name')
      .then(([products, query]) => {
        const dataString = JSON.stringify(products)
        if (utils.notSolved(challenges.unionSqlInjectionChallenge)) {
          let solved = true
          models.User.findAll().then(data => {
            const users = utils.queryResultToJson(data)
            if (users.data && users.data.length) {
              for (let i = 0; i < users.data.length; i++) {
                solved = solved && utils.containsOrEscaped(dataString, users.data[i].email) && utils.contains(dataString, users.data[i].password)
                if (!solved) {
                  break
                }
              }
              if (solved) {
                utils.solve(challenges.unionSqlInjectionChallenge)
              }
            }
          })
        }
        if (utils.notSolved(challenges.dbSchemaChallenge)) {
          let solved = true
          models.sequelize.query('SELECT sql FROM sqlite_master').then(([data, query]) => {
            const tableDefinitions = utils.queryResultToJson(data)
            if (tableDefinitions.data && tableDefinitions.data.length) {
              for (let i = 0; i < tableDefinitions.data.length; i++) {
                solved = solved && utils.containsOrEscaped(dataString, tableDefinitions.data[i].sql)
                if (!solved) {
                  break
                }
              }
              if (solved) {
                utils.solve(challenges.dbSchemaChallenge)
              }
            }
          })
        }
        res.json(utils.queryResultToJson(products))
      }).catch(error => {
        next(error)
      })
  }
}
