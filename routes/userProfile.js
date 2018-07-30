const fs = require('fs')
const models = require('../models/index')
const insecurity = require('../lib/insecurity')
const jade = require('jade')

module.exports = function getUserProfile () {
  return (req, res, next) => {
    fs.readFile('views/userProfile.jade', function (err, buf) {
      if (err) throw err
      const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        models.User.findById(loggedInUser.data.id).then(user => {
          var templateString = buf.toString()
          if (user.dataValues.username.match(/\#\{(.*)\}/) !== null) {
            req.app.locals.abused_ssti_bug = true
          }
          templateString = templateString.replace('usrname', user.dataValues.username)
          var fn = jade.compile(templateString)
          res.send(fn(user.dataValues))
        }).catch(error => {
          next(error)
        })
      } else {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
      }
    })
  }
}
