/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { ChallengeService } from '../Services/challenge.service'
import { ConfigurationService } from '../Services/configuration.service'
import { ChangeDetectorRef, Component, NgZone, type OnInit } from '@angular/core'
import { CookieService } from 'ngy-cookie'
import { CountryMappingService } from '../Services/country-mapping.service'
import { SocketIoService } from '../Services/socket-io.service'
import { ClipboardModule } from 'ngx-clipboard'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { LowerCasePipe } from '@angular/common'
import { firstValueFrom } from 'rxjs'

interface ChallengeSolvedMessage {
  challenge: string
  hidden?: any
  isRestore?: any
  flag: any
  key?: any
}

interface ChallengeSolvedNotification {
  key: string
  message: string
  flag: string
  country?: { code: string, name: string }
  copied: boolean
}

@Component({
  selector: 'app-challenge-solved-notification',
  templateUrl: './challenge-solved-notification.component.html',
  styleUrls: ['./challenge-solved-notification.component.scss'],
  imports: [MatCardModule, MatButtonModule, MatIconModule, ClipboardModule, LowerCasePipe, TranslateModule]
})
export class ChallengeSolvedNotificationComponent implements OnInit {
  public notifications: ChallengeSolvedNotification[] = []
  public showCtfFlagsInNotifications: boolean = false
  public showCtfCountryDetailsInNotifications: string = 'none'
  public countryMap?: any

  constructor (private readonly ngZone: NgZone, private readonly configurationService: ConfigurationService, private readonly challengeService: ChallengeService, private readonly countryMappingService: CountryMappingService, private readonly translate: TranslateService, private readonly cookieService: CookieService, private readonly ref: ChangeDetectorRef, private readonly io: SocketIoService) {
  }

  ngOnInit (): void {
    this.ngZone.runOutsideAngular(() => {
      this.io.socket().on('challenge solved', (data: ChallengeSolvedMessage) => {
        if (data?.challenge) {
          if (!data.hidden) {
            this.showNotification(data)
          }
          if (!data.isRestore) {
            this.saveProgress()
            if (!data.hidden) {
              import('../../confetti').then(module => {
                module.shootConfetti()
              })
            }
          }
          this.io.socket().emit('notification received', data.flag)
        }
      })
    })

    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config?.ctf) {
        if (config.ctf.showFlagsInNotifications) {
          this.showCtfFlagsInNotifications = config.ctf.showFlagsInNotifications
        } else {
          this.showCtfFlagsInNotifications = false
        }

        if (config.ctf.showCountryDetailsInNotifications) {
          this.showCtfCountryDetailsInNotifications = config.ctf.showCountryDetailsInNotifications

          if (config.ctf.showCountryDetailsInNotifications !== 'none') {
            this.countryMappingService.getCountryMapping().subscribe({
              next: (countryMap: any) => {
                this.countryMap = countryMap
              },
              error: (err) => { console.log(err) }
            })
          }
        } else {
          this.showCtfCountryDetailsInNotifications = 'none'
        }
      }
    })
  }

  closeNotification (index: number, shiftKey: boolean = false) {
    if (shiftKey) {
      this.ngZone.runOutsideAngular(() => {
        this.io.socket().emit('verifyCloseNotificationsChallenge', this.notifications)
      })
      this.notifications = []
    } else {
      this.notifications.splice(index, 1)
    }
    this.ref.detectChanges()
  }

  showNotification (challenge: ChallengeSolvedMessage) {
    firstValueFrom(this.translate.get('CHALLENGE_SOLVED', { challenge: challenge.challenge }))
      .then((message) => {
        let country
        if (this.showCtfCountryDetailsInNotifications && this.showCtfCountryDetailsInNotifications !== 'none') {
          country = this.countryMap[challenge.key]
        }
        this.notifications.push({
          message,
          key: challenge.key,
          flag: challenge.flag,
          country,
          copied: false
        })
        this.ref.detectChanges()
      })
  }

  saveProgress () {
    this.challengeService.continueCode().subscribe({
      next: (continueCode) => {
        if (!continueCode) {
          throw (new Error('Received invalid continue code from the server!'))
        }
        const expires = new Date()
        expires.setFullYear(expires.getFullYear() + 1)
        this.cookieService.put('continueCode', continueCode, { expires })
      },
      error: (err) => { console.log(err) }
    })
  }
}
