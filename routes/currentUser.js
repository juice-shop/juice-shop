'use strict'

var insecurity = require('../lib/insecurity')

exports = module.exports = function retrieveLoggedInUser () {
  return function (req, res) {
    var user = insecurity.authenticatedUsers.from(req)
    res.json({user: {id: (user ? user.data.id : undefined), email: (user ? user.data.email : undefined)}})
  }
}
