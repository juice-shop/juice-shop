/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const server = require('./../server.js')

module.exports = async () => {
  server.close()
}
