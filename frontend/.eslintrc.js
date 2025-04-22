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
    // FIXME warnings below this line need to be checked and fixed.
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/require-await': 'off',
    'prefer-rest-params': 'off',
    // FIXME warnings below this line were introduced with turning on type recommendations.
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    '@typescript-eslint/unbound-method': 'off'
  }
}
