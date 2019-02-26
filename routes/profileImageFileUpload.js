const utils = require('../lib/utils')
const fs = require('fs')
const models = require('../models/index')
const insecurity = require('../lib/insecurity')
const logger = require('../lib/logger')

module.exports = function fileUpload () {
  return (req, res, next) => {
    const file = req.file
    if (utils.endsWith(file.originalname.toLowerCase(), '.jpg')) {
      const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        const buffer = file.buffer
        fs.open('frontend/dist/frontend/assets/public/images/uploads/' + loggedInUser.data.id + '.jpg', 'w', function (err, fd) {
          if (err) logger.warn('Error opening file: ' + err.message)
          fs.write(fd, buffer, 0, buffer.length, null, function (err) {
            if (err) logger.warn('Error writing file: ' + err.message)
            fs.close(fd, function () { })
          })
        })
        models.User.findByPk(loggedInUser.data.id).then(user => {
          return user.update({ profileImage: loggedInUser.data.id + '.jpg' })
        }).catch(error => {
          next(error)
        })
      } else {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
      }
      res.location('/profile')
      res.redirect('/profile')
    }
    res.status(204).end()
  }
}
