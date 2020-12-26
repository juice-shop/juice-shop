/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: 'standard-with-typescript',
  parserOptions: {
    project: './src/tsconfig.*.json',
    sourceType: 'module'
  },
  rules: { // FIXME New linting errors since migrating from StandardJS-style TSLint. Should be gradually turned back on and fixed.
    'no-return-assign': 'off',
    'no-useless-escape': 'off',
    'promise/param-names': 'off',
    'standard/no-callback-literal': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-invalid-void-type': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off'
  }
}
