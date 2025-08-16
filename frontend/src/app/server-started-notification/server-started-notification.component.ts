/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { ChallengeService } from '../Services/challenge.service'
import { ChangeDetectorRef, Component, NgZone, type OnInit } from '@angular/core'
import { CookieService } from 'ngy-cookie'
import { SocketIoService } from '../Services/socket-io.service'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule, MatCardContent } from '@angular/material/card'

interface HackingProgress {
  autoRestoreMessage: string | null
  cleared: boolean
}

@Component({
  selector: 'app-server-started-notification',
  templateUrl: './server-started-notification.component.html',
  styleUrls: ['./server-started-notification.component.scss'],
  imports: [MatCardModule, MatCardContent, TranslateModule, MatButtonModule, MatIconModule]
})
export class ServerStartedNotificationComponent implements OnInit {
  public hackingProgress: HackingProgress = {} as HackingProgress

  constructor (private readonly ngZone: NgZone, private readonly challengeService: ChallengeService, private readonly translate: TranslateService, private readonly cookieService: CookieService, private readonly ref: ChangeDetectorRef, private readonly io: SocketIoService) {
  }

  ngOnInit (): void {
    this.ngZone.runOutsideAngular(() => {
      this.io.socket().on('server started', () => {
        const continueCode = this.cookieService.get('continueCode')
        const continueCodeFindIt = this.cookieService.get('continueCodeFindIt')
        const continueCodeFixIt = this.cookieService.get('continueCodeFixIt')
        if (continueCode) {
          this.challengeService.restoreProgress(encodeURIComponent(continueCode)).subscribe({
            next: () => {
              this.translate.get('AUTO_RESTORED_PROGRESS').subscribe({
                next: (notificationServerStarted) => {
                  this.hackingProgress.autoRestoreMessage = notificationServerStarted
                },
                error: (translationId) => {
                  this.hackingProgress.autoRestoreMessage = translationId
                }
              })
            },
            error: (error) => {
              console.log(error)
              this.translate.get('AUTO_RESTORE_PROGRESS_FAILED', { error }).subscribe({
                next: (notificationServerStarted) => {
                  this.hackingProgress.autoRestoreMessage = notificationServerStarted
                },
                error: (translationId) => {
                  this.hackingProgress.autoRestoreMessage = translationId
                }
              })
            }
          })
        }
        if (continueCodeFindIt) {
          this.challengeService.restoreProgressFindIt(encodeURIComponent(continueCodeFindIt)).subscribe({
            next: () => {
            },
            error: (error) => {
              console.log(error)
            }
          })
        }
        if (continueCodeFixIt) {
          this.challengeService.restoreProgressFixIt(encodeURIComponent(continueCodeFixIt)).subscribe({
            next: () => {
            },
            error: (error) => {
              console.log(error)
            }
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
    this.cookieService.remove('continueCodeFixIt')
    this.cookieService.remove('continueCodeFindIt')
    this.cookieService.remove('token')
    sessionStorage.removeItem('bid')
    sessionStorage.removeItem('itemTotal')
    localStorage.removeItem('token')
    localStorage.removeItem('displayedDifficulties')
    localStorage.removeItem('showSolvedChallenges')
    localStorage.removeItem('showDisabledChallenges')
    localStorage.removeItem('showOnlyTutorialChallenges')
    localStorage.removeItem('displayedChallengeCategories')
    this.hackingProgress.cleared = true
  }
}
