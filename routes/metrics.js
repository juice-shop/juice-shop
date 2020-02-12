/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const Prometheus = require('prom-client')
const orders = require('../data/mongodb').orders
const challenges = require('../data/datacache').challenges
const utils = require('../lib/utils')
const config = require('config')
const models = require('../models')
const Op = models.Sequelize.Op

exports.serveMetrics = function serveMetrics (reg) {
  return (req, res, next) => {
    utils.solveIf(challenges.exposedMetricsChallenge, () => { return true })
    res.set('Content-Type', reg.contentType)
    res.end(reg.metrics())
  }
}

exports.observeMetrics = function observeMetrics () {
  const app = config.get('application.metricsAppLabelValue')
  const register = new Prometheus.Registry()
  const intervalCollector = Prometheus.collectDefaultMetrics({ timeout: 5000, register })
  register.setDefaultLabels({ app })

  const orderMetrics = new Prometheus.Gauge({
    name: `${app}_orders_placed_total`,
    help: `Number of orders placed in ${config.get('application.name')}`
  })

  const challengeMetrics = new Prometheus.Gauge({
    name: `${app}_challenges_solved_total`,
    help: 'Number of challenges that have been solved'
  })

  const userMetrics = new Prometheus.Gauge({
    name: `${app}_users_registered_total`,
    help: 'Number of registered users'
  })

  const deluxeMetrics = new Prometheus.Gauge({
    name: `${app}_users_registered_deluxe`,
    help: 'Number of users with a Deluxe Membership'
  })

  const walletMetrics = new Prometheus.Gauge({
    name: `${app}_wallet_balance_total`,
    help: 'Total balance of all users\' digital wallets'
  })

  register.registerMetric(orderMetrics)
  register.registerMetric(challengeMetrics)
  register.registerMetric(userMetrics)
  register.registerMetric(deluxeMetrics)
  register.registerMetric(walletMetrics)

  const updateLoop = setInterval(() => {
    orders.count({}).then(orders => {
      orderMetrics.set(orders)
    })
    models.User.count({ where: { role: { [Op.in]: ['customer', 'deluxe'] } } }).then(count => {
      userMetrics.set(count)
    })
    models.User.count({ where: { role: { [Op.eq]: 'deluxe' } } }).then(count => {
      deluxeMetrics.set(count)
    })
    models.Wallet.sum('balance').then(totalBalance => {
      walletMetrics.set(totalBalance)
    })
    challengeMetrics.set(Object.keys(challenges).filter((key) => (challenges[key].solved)).length)
  }, 5000)

  return {
    register: register,
    probe: intervalCollector,
    updateLoop: updateLoop
  }
}
