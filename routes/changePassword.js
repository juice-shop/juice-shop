const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const models = require('../models/index')
const cache = require('../data/datacache')
const challenges = cache.challenges

exports = module.exports = function changePassword () {
  return ({query, cookies, connection}, res, next) => {
    const currentPassword = query.current
    const newPassword = query.new
    const repeatPassword = query.repeat
    if (!newPassword || newPassword === 'undefined') {
      res.status(401).send('Password cannot be empty.')
    } else if (newPassword !== repeatPassword) {
      res.status(401).send('New and repeated password do not match.')
    } else {
      const loggedInUser = insecurity.authenticatedUsers.get(cookies.token)
      if (loggedInUser) {
        if (currentPassword && insecurity.hash(currentPassword) !== loggedInUser.data.password) {
          res.status(401).send('Current password is not correct.')
        } else {
          models.User.findById(loggedInUser.data.id).then(user => {
            user.updateAttributes({ password: newPassword }).then(user => {
              if (utils.notSolved(challenges.csrfChallenge) && user.id === 3) {
                if (user.password === insecurity.hash('slurmCl4ssic')) {
                  utils.solve(challenges.csrfChallenge)
                }
              }
              res.json({ user })
            }).catch(error => {
              next(error)
            })
          }).catch(error => {
            next(error)
          })
        }
      } else {
        next(new Error('Blocked illegal activity by ' + connection.remoteAddress))
      }
    }
  }
}
