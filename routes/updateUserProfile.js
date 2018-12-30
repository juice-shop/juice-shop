const models = require('../models/index')
const insecurity = require('../lib/insecurity')

module.exports = function updateUserProfile () {
  return (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)

    let filteredUsername
    filteredUsername = req.body.username.replace(/(script|iframe|window|javascript|href|value)/ig, '')

    if (loggedInUser) {
      models.User.findByPk(loggedInUser.data.id).then(user => {
        return user.updateAttributes({ username: filteredUsername })
      }).catch(error => {
        next(error)
      })
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
    res.location('/profile')
    res.redirect('/profile')
  }
}
