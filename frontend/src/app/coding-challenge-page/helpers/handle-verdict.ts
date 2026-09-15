/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type DestroyRef, type OutputEmitterRef } from '@angular/core'
import { type ChallengeService } from '../../Services/challenge.service'
import { type CookieService } from 'ngy-cookie'
import { ResultState } from '../coding-challenge.types'

export function handleVerdict (config: {
  verdict: boolean
  variant: 'FindIt' | 'FixIt'
  challengeService: ChallengeService
  cookieService: CookieService
  solved: OutputEmitterRef<void>
  destroyRef: DestroyRef
  setResult: (result: ResultState) => void
  setShaking: (shaking: boolean) => void
}): void {
  let destroyed = false
  config.destroyRef.onDestroy(() => { destroyed = true })
  if (config.verdict) {
    config.setResult(ResultState.Right)
    const continueMethod = config.variant === 'FindIt'
      ? config.challengeService.continueCodeFindIt()
      : config.challengeService.continueCodeFixIt()
    continueMethod.subscribe({
      next: (continueCode) => {
        if (!continueCode) {
          throw (new Error('Received invalid continue code from the server!'))
        }
        const expires = new Date()
        expires.setFullYear(expires.getFullYear() + 1)
        config.cookieService.put(`continueCode${config.variant}`, continueCode, { expires })
      },
      error: (err) => { console.log(err) }
    })
    import('../../../confetti').then(module => {
      module.shootConfetti()
    }).then(() => {
      if (!destroyed) {
        config.solved.emit(undefined)
      }
    })
  } else {
    config.setResult(ResultState.Wrong)
    config.setShaking(true)
  }
}
