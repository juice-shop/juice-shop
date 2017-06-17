var connection = require('mongoose').connection
var Secret = require('./secrets').Secret

var utils = require('../lib/utils')
var challenges = require('../data/datacache').challenges

module.exports = function (req, res, next) {
  if (connection.readyState === 1) {
    Secret.find({}).then(function (result) {
      if (result.length > 1) {
        if (utils.notSolved(challenges.noSqlDirectAccess)) {
          utils.solve(challenges.noSqlDirectAccess)
        }
      }
    }, function (err) {
      if (err) {
        console.log('Could not reach MongoDB to check for direct access...')
      }
    })
  }

  next()
}
