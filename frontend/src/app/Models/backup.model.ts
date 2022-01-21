/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export interface Backup {
  version: number
  continueCode?: string
  continueCodeFindIt?: string
  continueCodeFixIt?: string
  language?: string
  banners?: { welcomeBannerStatus?: string, cookieConsentStatus?: string }
  scoreBoard?: { showOnlyTutorialChallenges?: boolean, displayedChallengeCategories?: string[], displayedDifficulties?: number[], showDisabledChallenges?: boolean, showSolvedChallenges?: boolean }
}
