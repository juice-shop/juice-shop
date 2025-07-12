/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, Input, type OnInit } from '@angular/core'
import { EnrichedChallenge } from '../../types/EnrichedChallenge'
import { Config } from 'src/app/Services/configuration.service'
import { ChallengeHintPipe } from '../../pipes/challenge-hint.pipe'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { NgFor, NgIf, NgClass, AsyncPipe } from '@angular/common'
import { DifficultyStarsComponent } from '../difficulty-stars/difficulty-stars.component'
import { WindowRefService } from 'src/app/Services/window-ref.service' // Import WindowRefService

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

  // NEW: State for hint button (0: initial, 1: hint revealed, 2: link opened)
  public hintState: number = 0

  // NEW: Inject WindowRefService for safe window access
  constructor (private readonly windowRefService: WindowRefService) {}

  async ngOnInit () {
    const { hasInstructions, startHackingInstructorFor } = await import('../../../../hacking-instructor')
    this.hasInstructions = hasInstructions
    this.startHackingInstructorFor = startHackingInstructorFor
  }

  // NEW: Logic for the new hint button behavior
  handleHintClick () {
    switch (this.hintState) {
      case 0:
        // First click: Reveal hint
        this.hintState = 1
        // In the future, this is where we will send the request to the backend.
        break
      case 1:
        // Second click: Redirect to hintUrl
        if (this.challenge.hintUrl) {
          this.windowRefService.nativeWindow.open(this.challenge.hintUrl, '_blank')
          this.hintState = 2
        }
        break
      case 2:
        // Subsequent clicks: Still redirect
        if (this.challenge.hintUrl) {
          this.windowRefService.nativeWindow.open(this.challenge.hintUrl, '_blank')
        }
        break
    }
  }

  // NEW: Method to determine which icon to show for the locks
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
    return 'lock' // Default case
  }

  // NEW: Method to control the tooltip content
  getHintTooltip (): string {
    if (this.hintState === 0) {
      return 'Click to reveal hint' // Or a translated version
    }
    return this.challenge.hint || ''
  }
}
