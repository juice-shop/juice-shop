'use strict'

var utils = require('../lib/utils')
var insecurity = require('../lib/insecurity')
var models = require('../models/index')

exports = module.exports = function retrieveUserList () {
  return function (req, res, next) {
    models.User.findAll().success(function (users) {
      var usersWithLoginStatus = utils.queryResultToJson(users)
      usersWithLoginStatus.data.forEach(function (user) {
        user.token = insecurity.authenticatedUsers.tokenOf(user)
      })
      res.json(usersWithLoginStatus)
    }).error(function (error) {
      next(error)
    })
  }
}
