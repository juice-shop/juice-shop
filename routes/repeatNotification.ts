/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import utils = require('../lib/utils')
import { Request, Response } from 'express'

module.exports = function repeatNotification () {
  return ({ query }: Request, res: Response) => {
    const challengeName: string = decodeURIComponent(query.challenge)
    const challenge = utils.findChallengeByName(challengeName)

    if (challenge?.solved) {
      utils.sendNotification(challenge, true)
    }

    res.sendStatus(200)
  }
}
