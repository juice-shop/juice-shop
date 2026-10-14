/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export default {
  extends: 'stylelint-config-sass-guidelines',
  plugins: [
    'stylelint-scss',
    './stylelint-plugin-spacing-fixer.mjs'
  ],
  rules: {
    'selector-max-id': 1,
    'selector-max-compound-selectors': 4,
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['ng-deep']
      }
    ],
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    'selector-no-vendor-prefix': null,
    'selector-no-qualifying-type': null,
    'selector-class-pattern': null,
    'declaration-property-value-disallowed-list': {
      '/^(margin|padding|gap)/': ['/(px|rem)$/']
    },
    'stylelint-plugin-spacing-fixer/declaration-property-value-disallowed-list': {
      '/^(margin|padding|gap)/': ['/(px|rem)$/']
    }
  }
}
