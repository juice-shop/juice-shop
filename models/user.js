/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
const security = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const config = require('config')

module.exports = (sequelize, { STRING, BOOLEAN }) => {
  const User = sequelize.define('User', {
    username: {
      type: STRING,
      defaultValue: '',
      set (username) {
        if (!utils.disableOnContainerEnv()) {
          username = security.sanitizeLegacy(username)
        } else {
          username = security.sanitizeSecure(username)
        }
        this.setDataValue('username', username)
      }
    },
    email: {
      type: STRING,
      unique: true,
      set (email) {
        if (!utils.disableOnContainerEnv()) {
          utils.solveIf(challenges.persistedXssUserChallenge, () => { return utils.contains(email, '<iframe src="javascript:alert(`xss`)">') })
        } else {
          email = security.sanitizeSecure(email)
        }
        this.setDataValue('email', email)
      }
    },
    password: {
      type: STRING,
      set (clearTextPassword) {
        this.setDataValue('password', security.hash(clearTextPassword))
      }
    },
    role: {
      type: STRING,
      defaultValue: 'customer',
      validate: {
        isIn: [['customer', 'deluxe', 'accounting', 'admin']]
      },
      set (role) {
        const profileImage = this.getDataValue('profileImage')
        if (role === security.roles.admin && (!profileImage || profileImage === '/assets/public/images/uploads/default.svg')) {
          this.setDataValue('profileImage', '/assets/public/images/uploads/defaultAdmin.png')
        }
        this.setDataValue('role', role)
      }
    },
    deluxeToken: {
      type: STRING,
      defaultValue: ''
    },
    lastLoginIp: {
      type: STRING,
      defaultValue: '0.0.0.0'
    },
    profileImage: {
      type: STRING,
      defaultValue: '/assets/public/images/uploads/default.svg'
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
