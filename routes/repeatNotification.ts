/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import utils = require('../lib/utils')

module.exports = function repeatNotification () {
  return ({ query }, res) => {
    const challengeName = decodeURIComponent(query.challenge)
    const challenge = utils.findChallenge(challengeName)

    if (challenge && challenge.solved) {
      utils.sendNotification(challenge, true)
    }

    res.sendStatus(200)
  }
}
