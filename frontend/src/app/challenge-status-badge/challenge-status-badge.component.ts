import { Component, Input } from '@angular/core'
import { WindowRefService } from '../Services/window-ref.service'
import { ChallengeService } from '../Services/challenge.service'

import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faBook } from '@fortawesome/free-solid-svg-icons'
import { faFlag } from '@fortawesome/free-regular-svg-icons'

library.add(faBook, faFlag)
dom.watch()

@Component({
  selector: 'app-challenge-status-badge',
  templateUrl: './challenge-status-badge.component.html',
  styleUrls: ['./challenge-status-badge.component.scss']
})
export class ChallengeStatusBadgeComponent {

  @Input('challenge') public challenge
  @Input('allowRepeatNotifications') public allowRepeatNotifications: boolean = false
  @Input('showChallengeHints') public showChallengeHints: boolean = true

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

  // tslint:disable-next-line:no-empty
  noop () { }
}
