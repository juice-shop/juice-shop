/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const models = require('../models/index')
const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports.upgradeToDeluxe = function upgradeToDeluxe () {
  return async (req, res, next) => {
    if (req.body.paymentMode === 'wallet') {
      await models.Wallet.decrement({ balance: 49 }, { where: { UserId: req.body.UserId } })
    }
    models.User.findOne({ where: { id: req.body.UserId, role: insecurity.roles.customer } })
      .then(user => {
        if (user) {
          user.update({ role: insecurity.roles.deluxe, deluxeToken: insecurity.deluxeToken(user.dataValues.email) })
            .then(user => {
              utils.solveIf(challenges.freeDeluxeChallenge, () => { return insecurity.verify(utils.jwtFrom(req)) && req.body.paymentMode !== 'wallet' && req.body.paymentMode !== 'card' })
              res.status(200).json({ status: 'success', data: { confirmation: 'Congratulations! You are now a deluxe member!' } })
            })
        } else {
          res.status(400).json({ status: 'error', error: 'Something went wrong. Please try again!' })
        }
      })
  }
}

module.exports.deluxeMembershipStatus = function deluxeMembershipStatus () {
  return (req, res, next) => {
    if (insecurity.isCustomer(req)) {
      res.status(200).json({ status: 'success', data: { membershipCost: 49 } })
    } else if (insecurity.isDeluxe(req)) {
      res.status(400).json({ status: 'error', error: 'You are already a deluxe member!' })
    } else {
      res.status(400).json({ status: 'error', error: 'You are not eligible for deluxe membership!' })
    }
  }
}
