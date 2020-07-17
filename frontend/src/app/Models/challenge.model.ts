/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { SafeHtml } from '@angular/platform-browser'

export interface Challenge {
  name: string
  category: string
  tags?: string
  description?: string | SafeHtml
  difficulty: number
  hint?: string
  hintUrl?: string
  disabledEnv?: string
  solved?: boolean
  tutorialOrder?: number
  hasTutorial?: boolean
}
