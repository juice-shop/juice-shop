module.exports = {
  extends: [
    'stylelint-config-sass-guidelines'
  ],
  plugins: [
    'stylelint-scss',
    './stylelint-plugin-spacing-fixer.mjs'
  ],
  rules: {
    'scss/at-import-partial-extension': null,
    'max-nesting-depth': 3,
    'order/properties-alphabetical-order': null,
    'no-empty-source': null,
    'custom-property-pattern': null,
    'selector-class-pattern': null,
    'scss/dollar-variable-pattern': null,
    'primer-spacing/spacing': true
  }
}
