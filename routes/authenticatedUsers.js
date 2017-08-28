'use strict'

const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const models = require('../models/index')

exports = module.exports = function retrieveUserList () {
  return function (req, res, next) {
    models.User.findAll().success(function (users) {
      const usersWithLoginStatus = utils.queryResultToJson(users)
      usersWithLoginStatus.data.forEach(function (user) {
        user.token = insecurity.authenticatedUsers.tokenOf(user)
      })
      res.json(usersWithLoginStatus)
    }).error(function (error) {
      next(error)
    })
  }
}
