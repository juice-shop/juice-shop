/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

export interface Backup {
  continueCode?: string
  language?: string
  banners?: { welcomeBannerStatus?: string; cookieConsentStatus?: string }
  scoreBoard?: { showOnlyTutorialChallenges?: boolean; displayedChallengeCategories?: string[]; displayedDifficulties?: number[]; showDisabledChallenges?: boolean; showSolvedChallenges?: boolean }
}
