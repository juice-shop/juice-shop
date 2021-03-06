/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import server = require('./../server')

export = async () => await new Promise(async (resolve, reject) =>
  await server.start(err => {
    if (err) {
      reject(err)
    }
    resolve()
  })
)
