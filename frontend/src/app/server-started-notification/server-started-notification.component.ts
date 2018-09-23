import { TranslateService } from '@ngx-translate/core'
import { ChallengeService } from './../Services/challenge.service'
import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core'
import { environment } from 'src/environments/environment'
import { CookieService } from 'ngx-cookie'
import * as io from 'socket.io-client'

import fontawesome from '@fortawesome/fontawesome'
import { faTrash } from '@fortawesome/fontawesome-free-solid'

fontawesome.library.add(faTrash)

@Component({
  selector: 'app-server-started-notification',
  templateUrl: './server-started-notification.component.html',
  styleUrls: ['./server-started-notification.component.scss']
})
export class ServerStartedNotificationComponent implements OnInit {

  public io = io
  public socket
  public hackingProgress: any = {}

  constructor (private ngZone: NgZone, private challengeService: ChallengeService,private translate: TranslateService,private cookieService: CookieService,private ref: ChangeDetectorRef) {

  }

  ngOnInit () {
    this.ngZone.runOutsideAngular(() => {
      this.socket = this.io.connect(environment.hostServer)

      this.socket.on('server started', () => {
        let continueCode = this.cookieService.get('continueCode')
        if (continueCode) {
          this.challengeService.restoreProgress(encodeURIComponent(continueCode)).subscribe(() => {
            this.translate.get('AUTO_RESTORED_PROGRESS').subscribe((notificationServerStarted) => {
              this.hackingProgress.autoRestoreMessage = notificationServerStarted
            }, (translationId) => {
              this.hackingProgress.autoRestoreMessage = translationId
            })
          },(error) => {
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
    this.cookieService.remove('continueCode', { domain: document.domain })
    this.hackingProgress.cleared = true
  }

}
