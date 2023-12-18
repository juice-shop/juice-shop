/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core'
import { BehaviorSubject, type Subject } from 'rxjs'

export type ScoreBoardVersion = 'v1' | 'v2'

export const SCORE_BOARD_FEATURE_FLAG_KEY = 'score-board-version'

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  constructor () {
    const scoreBoardVersion = localStorage.getItem(SCORE_BOARD_FEATURE_FLAG_KEY)
    if (scoreBoardVersion) {
      this.defaultScoreBoard$.next(scoreBoardVersion as ScoreBoardVersion)
    }
  }

  public defaultScoreBoard$: Subject<ScoreBoardVersion> = new BehaviorSubject<ScoreBoardVersion>('v2')
  public setDefaultScoreBoard (scoreBoardVersion: ScoreBoardVersion) {
    this.defaultScoreBoard$.next(scoreBoardVersion)
    localStorage.setItem(SCORE_BOARD_FEATURE_FLAG_KEY, scoreBoardVersion)
  }
}
