/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import logger = require('../lib/logger')

module.exports = function countryMapping (config = require('config')) {
  return (req, res) => {
    try {
      const countryMapping = config.get('ctf.countryMapping')
      if (!countryMapping) {
        throw new Error('No country mapping found!')
      } else {
        res.send(countryMapping)
      }
    } catch (err) {
      logger.warn('Country mapping was requested but was not found in the selected config file. Take a look at the fbctf.yml config file to find out how to configure the country mappings required by FBCTF.')
      res.status(500).send()
    }
  }
}
