/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import server = require('./../server')

// eslint-disable-next-line no-async-promise-executor
export = async () => await new Promise(async (resolve, reject) =>
  await server.start(err => {
    if (err) {
      reject(err)
    }
    resolve()
  })
)
