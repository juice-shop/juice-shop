const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const models = require('../models/index')
const cache = require('../data/datacache')
const challenges = cache.challenges

module.exports = function changePassword () {
  return ({ query, headers, connection }, res, next) => {
    const currentPassword = query.current
    const newPassword = query.new
    const repeatPassword = query.repeat
    if (!newPassword || newPassword === 'undefined') {
      res.status(401).send('Password cannot be empty.')
    } else if (newPassword !== repeatPassword) {
      res.status(401).send('New and repeated password do not match.')
    } else {
      const token = headers.authorization ? headers.authorization.substr('Bearer='.length) : null
      const loggedInUser = insecurity.authenticatedUsers.get(token)
      if (loggedInUser) {
        if (currentPassword && insecurity.hash(currentPassword) !== loggedInUser.data.password) {
          res.status(401).send('Current password is not correct.')
        } else {
          models.User.findByPk(loggedInUser.data.id).then(user => {
            user.update({ password: newPassword }).then(user => {
              if (utils.notSolved(challenges.changePasswordBenderChallenge) && user.id === 3 && !currentPassword) {
                if (user.password === insecurity.hash('slurmCl4ssic')) {
                  utils.solve(challenges.changePasswordBenderChallenge)
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
