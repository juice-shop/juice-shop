/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type SafeHtml } from '@angular/platform-browser'

export interface Challenge {
  id?: number
  name: string
  key: string
  category: string
  tags?: string
  description?: string | SafeHtml
  difficulty: 1 | 2 | 3 | 4 | 5 | 6
  disabledEnv?: string
  solved?: boolean
  tutorialOrder?: number
  hasTutorial?: boolean
  hasSnippet?: boolean
  codingChallengeStatus?: 0 | 1 | 2
  mitigationUrl?: string
  hasCodingChallenge: boolean
}
