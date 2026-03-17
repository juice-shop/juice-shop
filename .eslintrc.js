/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

module.exports = {
  extends: 'standard-with-typescript',
  env: {
    browser: true,
    node: true,
    jasmine: true,
    mocha: true,
    jest: true
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    project: './tsconfig.json'
  },
  rules: {
    'semi': ['error', 'never']
  },
  ignorePatterns: [
    '.eslintrc.js',
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
        'no-void': 'off', // 37 violations in 12 files (checked 2026-03-16) - conflicting with recommendation from @typescript-eslint/no-floating-promises
        // FIXME warnings below this line need to be checked and fixed.
        '@typescript-eslint/explicit-function-return-type': 'off', // 394 violations in 126 files (checked 2026-03-16)
        '@typescript-eslint/strict-boolean-expressions': 'off', // 243 violations in 74 files (checked 2026-03-16)
        '@typescript-eslint/no-var-requires': 'off', // 1 violation in 1 file (checked 2026-03-16)
        '@typescript-eslint/no-unsafe-argument': 'off' // 333 violations in 55 files (checked 2026-03-16)
      }
    }
  ]
}
