/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, Input, inject } from '@angular/core'
import { WindowRefService } from '../Services/window-ref.service'
import { ChallengeService } from '../Services/challenge.service'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faWindows } from '@fortawesome/free-brands-svg-icons'

import { Challenge } from '../Models/challenge.model'
import { TranslateModule } from '@ngx-translate/core'

import { MatIconModule } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { MatButtonModule } from '@angular/material/button'

library.add(faWindows)

@Component({
  selector: 'app-challenge-status-badge',
  templateUrl: './challenge-status-badge.component.html',
  styleUrls: ['./challenge-status-badge.component.scss'],
  imports: [MatButtonModule, MatTooltip, MatIconModule, TranslateModule]
})
export class ChallengeStatusBadgeComponent {
  private readonly challengeService = inject(ChallengeService);
  private readonly windowRefService = inject(WindowRefService);

  @Input() public challenge: Challenge = { } as Challenge
  @Input() public allowRepeatNotifications = false
  @Input() public showChallengeHints = true

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
}
