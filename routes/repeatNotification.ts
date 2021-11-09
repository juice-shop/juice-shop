/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import utils = require('../lib/utils')

module.exports = function repeatNotification () {
  return ({ query }, res) => {
    const challengeName: string = decodeURIComponent(query.challenge)
    const challenge = utils.findChallengeByName(challengeName)

    if (challenge?.solved) {
      utils.sendNotification(challenge, true)
    }

    res.sendStatus(200)
  }
}
