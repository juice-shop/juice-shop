const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const models = require('../models/index')
const cache = require('../data/datacache')
const challenges = cache.challenges

exports = module.exports = function changePassword () {
  return (req, res, next) => {
    const currentPassword = req.query.current
    const newPassword = req.query.new
    const repeatPassword = req.query.repeat
    if (!newPassword || newPassword === 'undefined') {
      res.status(401).send('Password cannot be empty.')
    } else if (newPassword !== repeatPassword) {
      res.status(401).send('New and repeated password do not match.')
    } else {
      const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        if (currentPassword && insecurity.hash(currentPassword) !== loggedInUser.data.password) {
          res.status(401).send('Current password is not correct.')
        } else {
          models.User.find(loggedInUser.data.id).success(user => {
            user.updateAttributes({ password: newPassword }).success(user => {
              if (utils.notSolved(challenges.csrfChallenge) && user.id === 3) {
                if (user.password === insecurity.hash('slurmCl4ssic')) {
                  utils.solve(challenges.csrfChallenge)
                }
              }
              res.json({user: user})
            }).error(error => {
              next(error)
            })
          }).error(error => {
            next(error)
          })
        }
      } else {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
      }
    }
  }
}
