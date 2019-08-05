import { Component, Input } from '@angular/core'
import { WindowRefService } from '../Services/window-ref.service'
import { ChallengeService } from '../Services/challenge.service'

import { Challenge } from '../Models/challenge.model'

@Component({
  selector: 'app-challenge-status-badge',
  templateUrl: './challenge-status-badge.component.html',
  styleUrls: ['./challenge-status-badge.component.scss']
})
export class ChallengeStatusBadgeComponent {

  @Input() public challenge: Challenge = { } as Challenge
  @Input() public allowRepeatNotifications: boolean = false
  @Input() public showChallengeHints: boolean = true

  constructor (private challengeService: ChallengeService, private windowRefService: WindowRefService) { }

  repeatNotification () {
    if (this.allowRepeatNotifications) {
      this.challengeService.repeatNotification(encodeURIComponent(this.challenge.name)).subscribe(() => {
        this.windowRefService.nativeWindow.scrollTo(0, 0)
      },(err) => console.log(err))
    }
  }

  openHint () {
    if (this.showChallengeHints && this.challenge.hintUrl) {
      this.windowRefService.nativeWindow.open(this.challenge.hintUrl, '_blank')
    }
  }
}
