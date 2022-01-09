/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

module.exports = {
  extends: 'standard-with-typescript',
  env: {
    browser: true,
    node: true,
    jasmine: true,
    mocha: true,
    protractor: true
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    project: './tsconfig.json'
  },
  ignorePatterns: [
    'app/private/**',
    'vagrant/**',
    'frontend/**',
    'data/static/codefixes/**',
    'dist/**'
  ],
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      rules: {
        'no-void': 'off', // conflicting with recommendation from @typescript-eslint/no-floating-promises
        // FIXME warnings below this line need to be checked and fixed. Line end comments below are number of findings per rule on 24.03.2021
        '@typescript-eslint/explicit-function-return-type': 'off', // 132
        '@typescript-eslint/restrict-plus-operands': 'off', // 292
        '@typescript-eslint/strict-boolean-expressions': 'off', // 388
        '@typescript-eslint/restrict-template-expressions': 'off', // 466
        '@typescript-eslint/no-var-requires': 'off' // 502
      }
    }
  ]
}
