const models = require('../models/index')
const insecurity = require('../lib/insecurity')

module.exports = function dataSubject () {
  return (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
    if (loggedInUser) {
      const userData = {
        UserId: loggedInUser.data.id,
        deletionRequested: true
      }
      models.PrivacyRequests.create(userData).catch(
        (err) => {
          console.log('Could not insert user data:' + err)
        })
      models.User.findByPk(loggedInUser.data.id).then(user => {
        user.update({ isActive: false })
        return res.json({
          status: true
        })
      }).catch(error => {
        next(error)
      })
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
  }
}
