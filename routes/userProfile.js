const fs = require('fs')
const models = require('../models/index')
const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const jade = require('jade')
const config = require('config')

module.exports = function getUserProfile () {
  return (req, res, next) => {
    fs.readFile('views/userProfile.jade', function (err, buf) {
      if (err) throw err
      const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        models.User.findById(loggedInUser.data.id).then(user => {
          let jadeTemplate = buf.toString()
          let username = user.dataValues.username
          if (username.match(/#\{(.*)\}/) !== null && !utils.disableOnContainerEnv()) {
            req.app.locals.abused_ssti_bug = true
            const code = username.substring(2, username.length - 1)
            try {
              eval(code) // eslint-disable-line no-eval
            } catch (err) {
              username = '\\' + username
            }
          } else {
            username = '\\' + username
          }
          jadeTemplate = jadeTemplate.replace(/_username_/g, username)
          jadeTemplate = jadeTemplate.replace(/_hash_/g, insecurity.hash(user.dataValues.email))
          jadeTemplate = jadeTemplate.replace(/_title_/g, config.get('application.name'))
          jadeTemplate = jadeTemplate.replace(/_favicon_/g, favicon())
          const fn = jade.compile(jadeTemplate)
          res.send(fn(user.dataValues))
        }).catch(error => {
          next(error)
        })
      } else {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
      }
    })
  }

  function favicon () {
    let icon = config.get('application.favicon')
    icon = decodeURIComponent(icon.substring(icon.lastIndexOf('/') + 1))
    return icon
  }
}
