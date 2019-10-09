import { TranslateService } from '@ngx-translate/core'
import { ChallengeService } from '../Services/challenge.service'
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core'
import { CookieService } from 'ngx-cookie'
import { SocketIoService } from '../Services/socket-io.service'

import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

library.add(faTrash)
dom.watch()

interface HackingProgress {
  autoRestoreMessage: string | null,
  cleared: boolean
}

@Component({
  selector: 'app-server-started-notification',
  templateUrl: './server-started-notification.component.html',
  styleUrls: ['./server-started-notification.component.scss']
})
export class ServerStartedNotificationComponent implements OnInit {

  public hackingProgress: HackingProgress = {} as HackingProgress

  constructor (private ngZone: NgZone, private challengeService: ChallengeService,private translate: TranslateService,private cookieService: CookieService,private ref: ChangeDetectorRef, private io: SocketIoService) {
  }

  ngOnInit () {
    this.ngZone.runOutsideAngular(() => {

      this.io.socket().on('server started', () => {
        let continueCode = this.cookieService.get('continueCode')
        if (continueCode) {
          this.challengeService.restoreProgress(encodeURIComponent(continueCode)).subscribe(() => {
            this.translate.get('AUTO_RESTORED_PROGRESS').subscribe((notificationServerStarted) => {
              this.hackingProgress.autoRestoreMessage = notificationServerStarted
            }, (translationId) => {
              this.hackingProgress.autoRestoreMessage = translationId
            })
          },(error) => {
            console.log(error)
            this.translate.get('AUTO_RESTORE_PROGRESS_FAILED', { error: error }).subscribe((notificationServerStarted) => {
              this.hackingProgress.autoRestoreMessage = notificationServerStarted
            }, (translationId) => {
              this.hackingProgress.autoRestoreMessage = translationId
            })
          })

        }
        this.ref.detectChanges()
      })
    })
  }

  closeNotification () {
    this.hackingProgress.autoRestoreMessage = null
  }

  clearProgress () {
    this.cookieService.remove('continueCode')
    this.hackingProgress.cleared = true
  }

}
