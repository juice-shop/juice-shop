/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

// @ts-check
import neostandard from 'neostandard'
import globals from 'globals'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default [
  {
    ignores: [
      'app/private/**',
      'vagrant/**',
      'frontend/**',
      'data/static/codefixes/**',
      'dist/**',
      'build/**',
      'node_modules/**'
    ]
  },
  ...neostandard({ ts: true }),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
        ...globals.mocha,
        ...globals.jest,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
      }
    },
    rules: {
      semi: ['error', 'never']
    }
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      'no-void': 'off', // 37 violations in 12 files (checked 2026-03-16) - conflicting with recommendation from @typescript-eslint/no-floating-promises
      // FIXME warnings below this line need to be checked and fixed.
      '@typescript-eslint/explicit-function-return-type': 'off', // 394 violations in 126 files (checked 2026-03-16)
      '@typescript-eslint/strict-boolean-expressions': 'off', // 243 violations in 74 files (checked 2026-03-16)
      '@typescript-eslint/no-unsafe-argument': 'off' // 333 violations in 55 files (checked 2026-03-16)
    }
  }
]
