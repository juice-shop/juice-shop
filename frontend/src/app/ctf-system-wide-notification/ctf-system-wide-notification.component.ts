/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ChangeDetectorRef, Component, type OnDestroy, type OnInit, inject } from '@angular/core'
import { interval, of, type Subscription } from 'rxjs'
import { catchError, startWith, switchMap } from 'rxjs/operators'
import { ConfigurationService } from '../Services/configuration.service'
import { CtfSystemWideNotificationService, type SystemWideNotificationResponse } from '../Services/ctf-system-wide-notification.service'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'

@Component({
  selector: 'app-ctf-system-wide-notification',
  templateUrl: './ctf-system-wide-notification.component.html',
  styleUrls: ['./ctf-system-wide-notification.component.scss'],
  imports: [MatCardModule, MatButtonModule]
})
export class CtfSystemWideNotificationComponent implements OnInit, OnDestroy {
  private readonly configurationService = inject(ConfigurationService)
  private readonly notificationService = inject(CtfSystemWideNotificationService)
  private readonly ref = inject(ChangeDetectorRef)

  public notification: SystemWideNotificationResponse | null = null
  private dismissedAt: string | null = null
  private subscription: Subscription | null = null

  ngOnInit (): void {
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      const url = config?.ctf?.systemWideNotifications?.url
      const pollFrequencySeconds = config?.ctf?.systemWideNotifications?.pollFrequencySeconds
      if (!url || !pollFrequencySeconds) {
        return
      }

      this.subscription = interval(pollFrequencySeconds * 1000).pipe(
        startWith(0),
        switchMap(() => this.notificationService.fetchNotification(url).pipe(
          catchError(() => of(null))
        ))
      ).subscribe((data) => {
        if (data?.enabled && data.message && data.updatedAt !== this.dismissedAt) {
          this.notification = data
        } else {
          this.notification = null
        }
        this.ref.detectChanges()
      })
    })
  }

  ngOnDestroy (): void {
    this.subscription?.unsubscribe()
  }

  dismiss (): void {
    if (this.notification) {
      this.dismissedAt = this.notification.updatedAt
      this.notification = null
      this.ref.detectChanges()
    }
  }
}
