/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

// @ts-expect-error due to non-existing type definitions for MarsDB
import MarsDB = require('marsdb')
export const SONAR_REGEX = {
  BUGS: /\[\d+ Bug[s]?\]/g,
  VULNERABILITIES: /\[\d+ Vulnerabilit(?:ies|y)\]/g,
  SECURITY_HOTSPOTS: /\[\d+ Security Hotspot[s]?\]/g,
  CODE_SMELL: /\[\d+ Code Smell[s]?\]/g,
  DUPLICATIONS: /\[(\d+(\.\d+)?|\.\d+)%\]/g,
  COVERAGE: /\[(\d+(\.\d+)?|\.\d+)%\]/g,
  RATING: /!\[([A-Z])\]/g,
};
const reviews = new MarsDB.Collection('posts')
const orders = new MarsDB.Collection('orders')

const db = {
  reviews,
  orders
}

module.exports = db
