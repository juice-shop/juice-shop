/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, Input, type OnInit } from '@angular/core'
import { EnrichedChallenge } from '../../types/EnrichedChallenge'
import { Config } from '../../../Services/configuration.service'
import { ChallengeHintPipe } from '../../pipes/challenge-hint.pipe'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { NgFor, NgIf, NgClass, AsyncPipe } from '@angular/common'
import { DifficultyStarsComponent } from '../difficulty-stars/difficulty-stars.component'
import { WindowRefService } from '../../../Services/window-ref.service'
import { ChallengeService } from '../../../Services/challenge.service' // NEW: Import ChallengeService

@Component({
  selector: 'challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss'],
  imports: [DifficultyStarsComponent, NgFor, MatTooltip, NgIf, MatIconModule, NgClass, AsyncPipe, TranslateModule, ChallengeHintPipe]
})
export class ChallengeCardComponent implements OnInit {
  @Input()
  public challenge: EnrichedChallenge

  @Input()
  public openCodingChallengeDialog: (challengeKey: string) => void

  @Input()
  public repeatChallengeNotification: (challengeKey: string) => void

  @Input()
  public applicationConfiguration: Config

  public hasInstructions: (challengeName: string) => boolean = () => false
  public startHackingInstructorFor: (challengeName: string) => Promise<void> = async () => {}

  // MODIFIED: Use the hintState from the challenge object directly
  public get hintState (): number {
    return this.challenge.hintState || 0
  }

  public set hintState (value: number) {
    this.challenge.hintState = value
  }

  // MODIFIED: Inject ChallengeService
  constructor (
    private readonly windowRefService: WindowRefService,
    private readonly challengeService: ChallengeService
  ) {}

  async ngOnInit () {
    const { hasInstructions, startHackingInstructorFor } = await import('../../../../hacking-instructor')
    this.hasInstructions = hasInstructions
    this.startHackingInstructorFor = startHackingInstructorFor
  }

  handleHintClick () {
    switch (this.hintState) {
      case 0:
        this.hintState = 1
        this.challengeService.updateHintState(this.challenge.key, 1).subscribe()
        break
      case 1:
        if (this.challenge.hintUrl) {
          this.windowRefService.nativeWindow.open(this.challenge.hintUrl, '_blank')
          this.hintState = 2
          this.challengeService.updateHintState(this.challenge.key, 2).subscribe()
        }
        break
      case 2:
        if (this.challenge.hintUrl) {
          this.windowRefService.nativeWindow.open(this.challenge.hintUrl, '_blank')
        }
        break
    }
  }

  getHintIcon (lockNumber: 1 | 2): 'lock' | 'lock_open' {
    if (this.hintState === 0) {
      return 'lock'
    }
    if (this.hintState === 1) {
      return lockNumber === 1 ? 'lock_open' : 'lock'
    }
    if (this.hintState >= 2) {
      return 'lock_open'
    }
    return 'lock'
  }

  getHintTooltip (): string {
    if (this.hintState === 0) {
      return 'Click to reveal hint'
    }
    return this.challenge.hint || ''
  }
}
