/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import utils = require('../lib/utils')
import { Request, Response } from 'express'

const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')

module.exports = function trackOrder () {
  return (req: Request, res: Response) => {
    const id = utils.disableOnContainerEnv() ? String(req.params.id).replace(/[^\w-]+/g, '') : req.params.id

    utils.solveIf(challenges.reflectedXssChallenge, () => { return utils.contains(id, '<iframe src="javascript:alert(`xss`)">') })
    db.orders.find({ $where: `this.orderId === '${id}'` }).then(order => {
      const result = utils.queryResultToJson(order)
      utils.solveIf(challenges.noSqlOrdersChallenge, () => { return result.data.length > 1 })
      if (result.data[0] === undefined) {
        result.data[0] = { orderId: id }
      }
      res.json(result)
    }, () => {
      res.status(400).json({ error: 'Wrong Param' })
    })
  }
}
