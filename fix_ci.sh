#!/bin/bash
# Re-usable logic for fixing branch
if [ -f "frontend/stylelint.config.mjs" ]; then
    rm frontend/stylelint.config.mjs
    cat <<EOF > frontend/stylelint.config.js
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
EOF
fi

if ! grep -q ".aider*" .gitignore; then
    echo -e "\n.aider*\n" >> .gitignore
fi

npm run lint:fix
git add .
git commit -m "chore: fix CI/CD errors (stylelint and linting)"
