/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

module.exports = {
  extends: 'stylelint-config-sass-guidelines',
  plugins: [
    'stylelint-scss'
  ],
  rules: {
    'selector-pseudo-element-no-unknown': null,
    'selector-max-compound-selectors': null,
    'selector-max-id': null,
    'selector-class-pattern': null,
    'selector-no-qualifying-type': null,
    'property-no-unknown': null,
    'color-named': null
  }
}
