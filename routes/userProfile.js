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
          const templateString = buf.toString()
          let username = user.dataValues.username
          if (username.match(/#\{(.*)\}/) !== null) {
            req.app.locals.abused_ssti_bug = true
            const code = username.substring(2, username.length - 1)
            try {
              eval(code) // eslint-disable-line no-eval
            } catch (err) {
              username = '\\' + username
            }
          }
          const fn = jade.compile(templateString.replace('usrname', username));
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
