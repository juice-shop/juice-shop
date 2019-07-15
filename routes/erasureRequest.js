const models = require('../models/index')
const insecurity = require('../lib/insecurity')

module.exports = function erasureRequest () {
  return (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.from(req)
    if (loggedInUser) {
      const userData = {
        UserId: loggedInUser.data.id,
        deletionRequested: true
      }
      models.PrivacyRequest.create(userData).then(() => {
        res.status(202).send()
      }).catch((err) => {
        next(err)
      })
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
  }
}
