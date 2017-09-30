/* jslint node: true */
const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        unique: true,
        set(email) {
            if (utils.notSolved(challenges.persistedXssChallengeUser) && utils.contains(user.email, '<script>alert("XSS2")</script>')) {
              utils.solve(challenges.persistedXssChallengeUser)
            }
            this.setDataValue('email', email);
        }
    },
    password: {
        type: DataTypes.STRING,
        set(clearTextPassword) {
          this.setDataValue('password', insecurity.hash(clearTextPassword));
        }
    }
  })

  return User
}
