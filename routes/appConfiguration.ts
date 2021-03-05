/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')

module.exports = function retrieveAppConfiguration () {
  return (req, res) => {
    res.json({ config })
  }
}
