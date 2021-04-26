/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import server = require('./../server')

module.exports = async () => {
  server.close()
}
