const utils = require('../lib/utils')
const fs = require('fs')
const models = require('../models/index')
const insecurity = require('../lib/insecurity')

module.exports = function fileUpload () {
  return (req, res, next) => {
    const file = req.file
    if (utils.endsWith(file.originalname.toLowerCase(), '.jpg')) {
      const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        const buffer = file.buffer
        fs.open('frontend/dist/frontend/assets/public/images/uploads/' + loggedInUser.data.id + '.jpg', 'w', function (err, fd) {
          if (err) {
            console.log('error opening file: ' + err)
          }
          fs.write(fd, buffer, 0, buffer.length, null, function (err) {
            if (err) console.log('error opening file: ' + err)
            fs.close(fd, function () {
            })
          })
        })
        models.User.findByPk(loggedInUser.data.id).then(user => {
          return user.updateAttributes({ profileImage: loggedInUser.data.id + '.jpg' })
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
