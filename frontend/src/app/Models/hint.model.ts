/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export interface Hint {
  id: number
  ChallengeId: number
  text: string
  order: number
  unlocked?: boolean
}
