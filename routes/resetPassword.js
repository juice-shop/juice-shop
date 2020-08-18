/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const users = require('../data/datacache').users
const insecurity = require('../lib/insecurity')
const models = require('../models/index')
const config = require('config')

module.exports = function resetPassword () {
  return ({ body, connection }, res, next) => {
    const email = body.email
    const answer = body.answer
    const newPassword = body.new
    const repeatPassword = body.repeat
    if (!email || !answer) {
      next(new Error('Blocked illegal activity by ' + connection.remoteAddress))
    } else if (!newPassword || newPassword === 'undefined') {
      res.status(401).send(res.__('Password cannot be empty.'))
    } else if (newPassword !== repeatPassword) {
      res.status(401).send(res.__('New and repeated password do not match.'))
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
          res.status(401).send(res.__('Wrong answer to security question.'))
        }
      }).catch(error => {
        next(error)
      })
    }
  }
}

function verifySecurityAnswerChallenges (user, answer) {
  utils.solveIf(challenges.resetPasswordJimChallenge, () => { return user.id === users.jim.id && answer === 'Samuel' })
  utils.solveIf(challenges.resetPasswordBenderChallenge, () => { return user.id === users.bender.id && answer === 'Stop\'n\'Drop' })
  utils.solveIf(challenges.resetPasswordBjoernChallenge, () => { return user.id === users.bjoern.id && answer === 'West-2082' })
  utils.solveIf(challenges.resetPasswordMortyChallenge, () => { return user.id === users.morty.id && answer === '5N0wb41L' })
  utils.solveIf(challenges.resetPasswordBjoernOwaspChallenge, () => { return user.id === users.bjoernOwasp.id && answer === 'Zaya' })
  utils.solveIf(challenges.resetPasswordUvoginChallenge, () => { return user.id === users.uvogin.id && answer === 'Silence of the Lambs' })
  utils.solveIf(challenges.geoStalkingMetaChallenge, () => { return user.id === users.john.id && answer === config.get('challenges.geoStalking.securityAnswerJohn') })
  utils.solveIf(challenges.geoStalkingVisualChallenge, () => { return user.id === users.emma.id && answer === config.get('challenges.geoStalking.securityAnswerEmma') })
}
