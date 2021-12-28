/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')

module.exports = function retrieveAppConfiguration () {
  return (req, res) => {
    res.json({ config })
  }
}
