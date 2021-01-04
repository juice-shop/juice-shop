/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

module.exports = {
  extends: 'standard',
  env: {
    browser: true,
    jasmine: true,
    mocha: true,
    protractor: true
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  ignorePatterns: [
    'app/private/**',
    'vagrant/**',
    'frontend/**'
  ]
}
