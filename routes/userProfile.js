const fs = require('fs')
const models = require('../models/index')
const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const pug = require('pug')
const config = require('config')
const themes = require('../views/themes/themes').themes

module.exports = function getUserProfile () {
  return (req, res, next) => {
    fs.readFile('views/userProfile.pug', function (err, buf) {
      if (err) throw err
      const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        models.User.findByPk(loggedInUser.data.id).then(user => {
          let template = buf.toString()
          let username = user.dataValues.username
          if (username.match(/#\{(.*)\}/) !== null && !utils.disableOnContainerEnv()) {
            req.app.locals.abused_ssti_bug = true
            const code = username.substring(2, username.length - 1)
            try {
              username = eval(code) // eslint-disable-line no-eval
            } catch (err) {
              username = '\\' + username
            }
          } else {
            username = '\\' + username
          }
          const theme = themes[config.get('application.theme')]
          template = template.replace(/_username_/g, username)
          template = template.replace(/_emailHash_/g, insecurity.hash(user.dataValues.email))
          template = template.replace(/_title_/g, config.get('application.name'))
          template = template.replace(/_favicon_/g, favicon())
          template = template.replace(/_bgColor_/g, theme.bgColor)
          template = template.replace(/_textColor_/g, theme.textColor)
          template = template.replace(/_navColor_/g, theme.navColor)
          template = template.replace(/_primLight_/g, theme.primLight)
          template = template.replace(/_primDark_/g, theme.primDark)
          const fn = pug.compile(template)
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
    return utils.extractFilename(config.get('application.favicon'))
  }
}
