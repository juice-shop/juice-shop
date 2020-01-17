/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const config = require('config')

module.exports = (sequelize, { STRING, BOOLEAN }) => {
  const User = sequelize.define('User', {
    username: {
      type: STRING,
      defaultValue: '',
      set (username) {
        username = insecurity.sanitizeLegacy(username)
        utils.solveIf(challenges.usernameXssChallenge, () => { return utils.contains(username, '<script>alert(`xss`)</script>') })
        this.setDataValue('username', username)
      }
    },
    email: {
      type: STRING,
      unique: true,
      set (email) {
        utils.solveIf(challenges.persistedXssUserChallenge, () => { return utils.contains(email, '<iframe src="javascript:alert(`xss`)">') })
        this.setDataValue('email', email)
      }
    },
    password: {
      type: STRING,
      set (clearTextPassword) {
        this.setDataValue('password', insecurity.hash(clearTextPassword))
      }
    },
    role: {
      type: STRING,
      defaultValue: 'customer',
      validate: {
        isIn: [['customer', 'deluxe', 'accounting', 'admin']]
      }
    },
    lastLoginIp: {
      type: STRING,
      defaultValue: '0.0.0.0'
    },
    profileImage: {
      type: STRING,
      defaultValue: 'default.svg'
    },
    totpSecret: {
      type: STRING,
      defaultValue: ''
    },
    isActive: {
      type: BOOLEAN,
      defaultValue: true
    }
  }, { paranoid: true })

  User.addHook('afterValidate', (user) => {
    if (user.email && user.email.toLowerCase() === `acc0unt4nt@${config.get('application.domain')}`.toLowerCase()) {
      return Promise.reject(new Error('Nice try, but this is not how the "Ephemeral Accountant" challenge works!'))
    }
  })

  return User
}
