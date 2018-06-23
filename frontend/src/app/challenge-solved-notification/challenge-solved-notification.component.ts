import { TranslateService } from '@ngx-translate/core'
import { environment } from './../../environments/environment'
import { ChallengeService } from './../Services/challenge.service'
import { ConfigurationService } from './../Services/configuration.service'
import { Component, OnInit, NgZone } from '@angular/core'

import * as io from 'socket.io-client'
import { CookieService } from 'ngx-cookie'

@Component({
  selector: 'app-challenge-solved-notification',
  templateUrl: './challenge-solved-notification.component.html',
  styleUrls: ['./challenge-solved-notification.component.css']
})
export class ChallengeSolvedNotificationComponent implements OnInit {

  public socket
  public notifications = []
  constructor (private ngZone: NgZone, private configurationService: ConfigurationService, private challengeService: ChallengeService, private translate: TranslateService, private cookieService: CookieService) {

  }

  ngOnInit () {
    this.ngZone.runOutsideAngular(() => {
      this.socket = io.connect(environment.hostServer)
      this.socket.on('challenge solved', (data) => {
        if (data && data.challenge) {
          if (!data.hidden) {
            this.showNotification(data)
          }
          if (!data.isRestore) {
            this.saveProgress()
          }
          if (data.name === 'Score Board') {
            /* Set score-board visible through a service */
            // $rootScope.$emit('score_board_challenge_solved')
          }
          this.socket.emit('notification received', data.flag)
        }
      })
    })

    this.configurationService.getApplicationConfiguration().subscribe((config) => {

    })
  }

  closeNotification (index) {
    this.notifications.splice(index, 1)
  }

  showNotification (challenge) {
    this.translate.get('CHALLENGE_SOLVED', { challenge: challenge.challenge }).subscribe((challengeSolved) => {

    })
  }

  saveProgress () {
    this.challengeService.continueCode().subscribe((continueCode) => {
      if (!continueCode) {
        throw (new Error('Received invalid continue code from the sever!'))
      }
      let expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + 30)
      this.cookieService.put('continueCode', continueCode, { expires: expireDate })
    },(err) => console.log(err))
  }

}
