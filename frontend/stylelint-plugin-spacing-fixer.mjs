/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import stylelint from 'stylelint'

const SPACING_VARIABLES = [
  { name: '$space-3xs', rem: 0.125, px: 2 },
  { name: '$space-2xs', rem: 0.25, px: 4 },
  { name: '$space-xs', rem: 0.5, px: 8 },
  { name: '$space-s', rem: 0.625, px: 10 },
  { name: '$space-m', rem: 1, px: 16 },
  { name: '$space-ml', rem: 1.25, px: 20 },
  { name: '$space-l', rem: 1.5, px: 24 },
  { name: '$space-xl', rem: 2, px: 32 },
  { name: '$space-2xl', rem: 2.5, px: 40 },
  { name: '$space-3xl', rem: 3, px: 48 },
  { name: '$space-4xl', rem: 4, px: 64 }
];

const MAX_AUTO_FIX_VALUE = 80;

function remToPx (rem) {
  return rem * 16;
}

function findNearestVariable (valuePx) {
  const absPx = Math.abs(valuePx);
  const isNegative = valuePx < 0;

  if (absPx > MAX_AUTO_FIX_VALUE) {
    return null;
  }

  let nearest = null;
  let minDistance = Infinity;

  SPACING_VARIABLES.forEach(variable => {
    const distance = Math.abs(variable.px - absPx);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = variable;
    }
  });

  if (nearest && isNegative) {
    return {
      name: `-${nearest.name}`,
      rem: -nearest.rem,
      px: -nearest.px
    };
  }

  return nearest;
}

function parseValue (value) {
  const match = value.match(/^(-?[\d.]+)(px|rem)$/);
  if (!match) {
    return null;
  }
  return {
    number: parseFloat(match[1]),
    unit: match[2]
  };
}

function normalizeToPixels (value) {
  const parsed = parseValue(value);
  if (!parsed) return null;

  if (parsed.unit === 'px') {
    return parsed.number;
  } else if (parsed.unit === 'rem') {
    return remToPx(parsed.number);
  }
  return null;
}

const ruleName = 'stylelint-plugin-spacing-fixer/declaration-property-value-disallowed-list';

const plugin = stylelint.createPlugin(ruleName,
  function (primaryOption, secondaryOption, context) {
    return function (root, result) {
      if (!primaryOption) return;

      root.walkDecls(decl => {
        const propPattern = primaryOption['/^(margin|padding|gap)/'];
        if (!propPattern) return;

        const isSpacingProp = /^(margin|padding|gap)/.test(decl.prop);
        if (!isSpacingProp) return;

        const values = decl.value.split(/\s+/);
        let hasDisallowedValues = false;
        const newValues = [];

        values.forEach(value => {
          const valuePx = normalizeToPixels(value);

          if (valuePx !== null) {
            hasDisallowedValues = true;

            if (context.fix) {
              const nearest = findNearestVariable(valuePx);
              if (nearest) {
                newValues.push(nearest.name);
              } else {
                newValues.push(value);
              }
            } else {
              newValues.push(value);
            }
          } else {
            newValues.push(value);
          }
        });

        if (hasDisallowedValues && context.fix) {
          decl.value = newValues.join(' ');
        }
      });
    };
  }
);

export default plugin
