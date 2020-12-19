/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const Hashids = require('hashids/cjs')
const hashids = new Hashids('this is my salt', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
const challenges = require('../data/datacache').challenges

module.exports = function retrieveCurrentContinueCode () {
  return (req, res) => {
    const ids = []
    for (const name in challenges) {
      if (Object.prototype.hasOwnProperty.call(challenges, name)) {
        if (challenges[name].solved) ids.push(challenges[name].id)
      }
    }
    const continueCode = ids.length > 0 ? hashids.encode(ids) : undefined
    res.json({ continueCode })
  }
}
