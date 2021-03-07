/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
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
    'dist/**'
  ],
  overrides: [
    {
      /**
       * Purpose of this Section:
       *  Temporarily suppress TypeScript-related linting errors during migration to typescript.
       * When to remove:
       *  After all @typescript-eslint warnings are fixed/resolved.
       */
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-dynamic-delete': 'warn',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-misused-promises': 'warn',
        '@typescript-eslint/no-this-alias': 'warn',
        '@typescript-eslint/no-var-requires': 'warn',
        '@typescript-eslint/prefer-includes': 'warn',
        '@typescript-eslint/prefer-nullish-coalescing': 'warn',
        '@typescript-eslint/prefer-optional-chain': 'warn',
        '@typescript-eslint/promise-function-async': 'warn',
        '@typescript-eslint/restrict-template-expressions': 'warn',
        '@typescript-eslint/restrict-plus-operands': 'warn',
        '@typescript-eslint/return-await': 'warn',
        '@typescript-eslint/strict-boolean-expressions': 'warn'
      }
    }
  ]
}
