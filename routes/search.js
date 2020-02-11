/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const utils = require('../lib/utils')
const models = require('../models/index')
const challenges = require('../data/datacache').challenges

module.exports = function searchProducts () {
  return (req, res, next) => {
    let criteria = req.query.q === 'undefined' ? '' : req.query.q || ''
    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)
    models.sequelize.query(`SELECT * FROM Products WHERE ((name LIKE '%${criteria}%' OR description LIKE '%${criteria}%') AND deletedAt IS NULL) ORDER BY name`)
      .then(([products]) => {
        const dataString = JSON.stringify(products)
        utils.solveIf(challenges.unionSqlInjectionChallenge, () => {
          models.User.findAll().then(data => {
            const users = utils.queryResultToJson(data)
            if (users.data && users.data.length) {
              for (let i = 0; i < users.data.length; i++) {
                if (!utils.containsOrEscaped(dataString, users.data[i].email) && utils.contains(dataString, users.data[i].password)) {
                  return false
                }
              }
              return true
            }
          })
        })
        utils.solveIf(challenges.dbSchemaChallenge, () => {
          models.sequelize.query('SELECT sql FROM sqlite_master').then(([data]) => {
            const tableDefinitions = utils.queryResultToJson(data)
            if (tableDefinitions.data && tableDefinitions.data.length) {
              for (let i = 0; i < tableDefinitions.data.length; i++) {
                if (!utils.containsOrEscaped(dataString, tableDefinitions.data[i].sql)) {
                  return false
                }
              }
              return true
            }
          })
        })
        for (let i = 0; i < products.length; i++) {
          products[i].name = req.__(products[i].name)
          products[i].description = req.__(products[i].description)
        }
        res.json(utils.queryResultToJson(products))
      }).catch(error => {
        next(error)
      })
  }
}
