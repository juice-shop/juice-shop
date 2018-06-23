import { TranslateService } from '@ngx-translate/core'
import { ChallengeService } from './../Services/challenge.service'
import { Component, OnInit, NgZone } from '@angular/core'
import * as io from 'socket.io-client'

import fontawesome from '@fortawesome/fontawesome'
import { faTrash } from '@fortawesome/fontawesome-free-solid'
import { environment } from 'src/environments/environment'
fontawesome.library.add(faTrash)

@Component({
  selector: 'app-server-started-notification',
  templateUrl: './server-started-notification.component.html',
  styleUrls: ['./server-started-notification.component.css']
})
export class ServerStartedNotificationComponent implements OnInit {

  public socket
  public hackingProgress: any = {}

  constructor (private ngZone: NgZone, private challengeService: ChallengeService,private translate: TranslateService) {

  }

  ngOnInit () {
    this.ngZone.runOutsideAngular(() => {
      this.socket = io.connect(environment.hostServer)
      this.socket.on('server started', () => {
        let continueCode = localStorage.getItem('continueCode')
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
      })
    })
  }

  closeNotification () {
    this.hackingProgress.autoRestoreMessage = null
  }

  clearProgress () {
    localStorage.removeItem('continueCode')
    this.hackingProgress.cleared = true
  }

}
