/* jslint node: true */
const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {type: DataTypes.STRING, unique: true},
    password: DataTypes.STRING
  },
    {
      hooks: {
        beforeCreate: function (user, fn) {
          hashPasswordHook(user)
          xssChallengeUserHook(user)
          fn(null, user)
        },
        beforeUpdate: function (user, fn) { // Pitfall: Will hash the hashed password again if password was not updated!
          hashPasswordHook(user)
          fn(null, user)
        }
      }}
    )
  return User
}

function hashPasswordHook (user) {
  if (user.password) {
    user.password = insecurity.hash(user.password)
  };
}

function xssChallengeUserHook (user) {
  if (utils.notSolved(challenges.persistedXssChallengeUser) && utils.contains(user.email, '<script>alert("XSS2")</script>')) {
    utils.solve(challenges.persistedXssChallengeUser)
  }
}
