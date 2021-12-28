/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const protractorConfig = require('./protractor.conf.js').config

protractorConfig.baseUrl = 'http://localhost:3001/subfolder'
exports.config = protractorConfig
