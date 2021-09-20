/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = function servePremiumContent () {
  return (req, res) => {
    utils.solveIf(challenges.premiumPaywallChallenge, () => { return true })
    res.sendFile(path.resolve('frontend/dist/frontend/assets/private/JuiceShop_Wallpaper_1920x1080_VR.jpg'))
  }
}
