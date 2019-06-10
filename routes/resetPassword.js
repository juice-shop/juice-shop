const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const users = require('../data/datacache').users
const insecurity = require('../lib/insecurity')
const models = require('../models/index')

module.exports = function resetPassword () {
  return ({ body, connection }, res, next) => {
    const email = body.email
    const answer = body.answer
    const newPassword = body.new
    const repeatPassword = body.repeat
    if (!email || !answer) {
      next(new Error('Blocked illegal activity by ' + connection.remoteAddress))
    } else if (!newPassword || newPassword === 'undefined') {
      res.status(401).send('Password cannot be empty.')
    } else if (newPassword !== repeatPassword) {
      res.status(401).send('New and repeated password do not match.')
    } else {
      models.SecurityAnswer.findOne({
        include: [{
          model: models.User,
          where: { email }
        }]
      }).then(data => {
        if (insecurity.hmac(answer) === data.answer) {
          models.User.findByPk(data.UserId).then(user => {
            user.update({ password: newPassword }).then(user => {
              verifySecurityAnswerChallenges(user, answer)
              res.json({ user })
            }).catch(error => {
              next(error)
            })
          }).catch(error => {
            next(error)
          })
        } else {
          res.status(401).send('Wrong answer to security question.')
        }
      }).catch(error => {
        next(error)
      })
    }
  }
}

function verifySecurityAnswerChallenges (user, answer) {
  if (utils.notSolved(challenges.resetPasswordJimChallenge) && user.id === users.jim.id && answer === 'Samuel') {
    utils.solve(challenges.resetPasswordJimChallenge)
  }
  if (utils.notSolved(challenges.resetPasswordBenderChallenge) && user.id === users.bender.id && answer === 'Stop\'n\'Drop') {
    utils.solve(challenges.resetPasswordBenderChallenge)
  }
  if (utils.notSolved(challenges.resetPasswordBjoernChallenge) && user.id === users.bjoern.id && answer === 'West-2082') {
    utils.solve(challenges.resetPasswordBjoernChallenge)
  }
  if (utils.notSolved(challenges.resetPasswordMortyChallenge) && user.id === users.morty.id && answer === '5N0wb41L') {
    utils.solve(challenges.resetPasswordMortyChallenge)
  }
  if (utils.notSolved(challenges.resetPasswordBjoernOwaspChallenge) && user.id === users.bjoernOwasp.id && answer === 'Zaya') {
    utils.solve(challenges.resetPasswordBjoernOwaspChallenge)
  }
}
