const utils = require('../lib/utils')
const models = require('../models/index')
const challenges = require('../data/datacache').challenges

module.exports = function searchProducts () {
  return ({ query }, res, next) => {
    let criteria = query.q === 'undefined' ? '' : query.q || ''
    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)
    if (utils.notSolved(challenges.localXssChallenge) && utils.contains(criteria, '<iframe src="javascript:alert(\'xss\')">')) {
      utils.solve(challenges.localXssChallenge) // FIXME Verification on server side not possible as value never get submitted to it
    }
    models.sequelize.query('SELECT * FROM Products WHERE ((name LIKE \'%' + criteria + '%\' OR description LIKE \'%' + criteria + '%\') AND deletedAt IS NULL) ORDER BY name')
      .then(([products, query]) => {
        if (utils.notSolved(challenges.unionSqlInjectionChallenge)) {
          const dataString = JSON.stringify(products)
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
        res.json(utils.queryResultToJson(products))
      }).catch(error => {
        next(error)
      })
  }
}
