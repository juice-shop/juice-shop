/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

module.exports = {
  extends: [
    'standard-with-typescript',
    'plugin:@typescript-eslint/recommended-type-checked'
  ],
  root: true,
  parserOptions: {
    project: './src/tsconfig.*.json',
    sourceType: 'module'
  },
  ignorePatterns: [
    '.eslintrc.js',
  ],
  rules: {
    '@typescript-eslint/prefer-nullish-coalescing': 'off', // requires the `strictNullChecks` compiler option
    // Warnings below this line need to be checked and fixed.
    '@typescript-eslint/strict-boolean-expressions': 'warn',
    '@typescript-eslint/consistent-type-assertions': 'warn',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/restrict-template-expressions': 'warn',
    '@typescript-eslint/no-confusing-void-expression': 'warn',
    '@typescript-eslint/require-await': 'warn',
    'prefer-rest-params': 'off',
    // Warnings below this line were introduced with turning on type recommendations.
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-redundant-type-constituents': 'warn',
    '@typescript-eslint/unbound-method': 'warn'
  }
}