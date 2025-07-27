/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, Input } from '@angular/core'
import { WindowRefService } from '../Services/window-ref.service'
import { ChallengeService } from '../Services/challenge.service'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faWindows } from '@fortawesome/free-brands-svg-icons'

import { Challenge } from '../Models/challenge.model'
import { TranslateModule } from '@ngx-translate/core'
import { ExtendedModule } from '@angular/flex-layout/extended'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { MatButtonModule } from '@angular/material/button'
import { NgIf } from '@angular/common'

library.add(faWindows)

@Component({
  selector: 'app-challenge-status-badge',
  templateUrl: './challenge-status-badge.component.html',
  styleUrls: ['./challenge-status-badge.component.scss'],
  imports: [NgIf, MatButtonModule, MatTooltip, MatIconModule, ExtendedModule, TranslateModule]
})
export class ChallengeStatusBadgeComponent {
  @Input() public challenge: Challenge = { } as Challenge
  @Input() public allowRepeatNotifications: boolean = false
  @Input() public showChallengeHints: boolean = true

  constructor (private readonly challengeService: ChallengeService, private readonly windowRefService: WindowRefService) { }

  repeatNotification () {
    if (this.allowRepeatNotifications) {
      this.challengeService.repeatNotification(encodeURIComponent(this.challenge.name)).subscribe({
        next: () => {
          this.windowRefService.nativeWindow.scrollTo(0, 0)
        },
        error: (err) => { console.log(err) }
      })
    }
  }

  openHint () {
    if (this.showChallengeHints && this.challenge.hintUrl) {
      this.windowRefService.nativeWindow.open(this.challenge.hintUrl, '_blank')
    }
  }
}
