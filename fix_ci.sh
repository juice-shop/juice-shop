#!/bin/bash
if [ -f "frontend/stylelint.config.mjs" ]; then
    rm frontend/stylelint.config.mjs
fi
cat <<EOF > frontend/stylelint.config.js
module.exports = {
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
EOF

if ! grep -q ".aider*" .gitignore; then
    echo -e "\n.aider*\n" >> .gitignore
fi

npm run lint:fix
git add .
git commit -m "chore: fix CI/CD errors (stylelint and linting)"
