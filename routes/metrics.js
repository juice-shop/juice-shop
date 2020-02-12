/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const Prometheus = require('prom-client')
const orders = require('../data/mongodb').orders
const challenges = require('../data/datacache').challenges
const users = require('../data/datacache').users
const utils = require('../lib/utils')

exports.serveMetrics = function serveMetrics (reg) {
  return (req, res, next) => {
    utils.solveIf(challenges.exposedMetricsChallenge, () => (true))
    res.set('Content-Type', reg.contentType)
    res.end(reg.metrics())
  }
}

exports.observeMetrics = function observeMetrics () {
  const register = new Prometheus.Registry()
  const intervalCollector = Prometheus.collectDefaultMetrics({ timeout: 5000, register })
  register.setDefaultLabels({ app: 'juice-shop' })

  const orderMetrics = new Prometheus.Gauge({
    name: 'juice_shop_orders_placed_total',
    help: 'Number of orders placed in juice-shop so far'
  })

  const challengeMetrics = new Prometheus.Gauge({
    name: 'juice_shop_challenges_solved_total',
    help: 'Number of challenges that have been solved so far'
  })

  const userMetrics = new Prometheus.Gauge({
    name: 'juice_shop_users_registered_total',
    help: 'Number of users registered'
  })

  register.registerMetric(orderMetrics)
  register.registerMetric(challengeMetrics)
  register.registerMetric(userMetrics)

  const updateLoop = setInterval(() => {
    orders.count({}).then(function (orders) {
      orderMetrics.set(orders)
    })
    challengeMetrics.set(Object.keys(challenges).filter((key) => (challenges[key].solved)).length)
    userMetrics.set(Object.keys(users).length)
  }, 5000)

  return {
    register: register,
    probe: intervalCollector,
    updateLoop: updateLoop
  }
}
