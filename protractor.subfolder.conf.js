/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const protractorConfig = require('./protractor.conf.js').config

protractorConfig.baseUrl = 'http://localhost:3001/subfolder'
exports.config = protractorConfig
