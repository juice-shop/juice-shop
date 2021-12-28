/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
const utils = require('../lib/utils')

module.exports = function retrieveAppVersion () {
  return (req, res) => {
    res.json({
      version: config.get('application.showVersionNumber') ? utils.version() : ''
    })
  }
}
