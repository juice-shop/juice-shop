/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = function servePrivacyPolicyProof () {
  return (req, res) => {
    utils.solveIf(challenges.privacyPolicyProofChallenge, () => { return true })
    res.sendFile(path.resolve('frontend/dist/frontend/assets/private/thank-you.jpg'))
  }
}
