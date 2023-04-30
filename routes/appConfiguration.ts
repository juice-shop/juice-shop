/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import { Request, Response } from 'express'

module.exports = function retrieveAppConfiguration () {
  return (_req: Request, res: Response) => {
    res.json({ config })
  }
}
