/* jslint node: true */
const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, { STRING }) => {
  const User = sequelize.define('User', {
    email: {
      type: STRING,
      unique: true,
      set (email) {
        if (utils.notSolved(challenges.persistedXssChallengeUser) && utils.contains(email, '<script>alert("XSS")</script>')) {
          utils.solve(challenges.persistedXssChallengeUser)
        }
        this.setDataValue('email', email)
      }
    },
    password: {
      type: STRING,
      set (clearTextPassword) {
        this.setDataValue('password', insecurity.hash(clearTextPassword))
      }
    }
  })

  return User
}
