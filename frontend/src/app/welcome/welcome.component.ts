/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, inject } from '@angular/core'
import { ConfigurationService } from '../Services/configuration.service'
import { MatDialog } from '@angular/material/dialog'
import { WelcomeBannerComponent } from '../welcome-banner/welcome-banner.component'
import { CookieService } from 'ngy-cookie'

@Component({
  selector: 'app-welcome',
  templateUrl: 'welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  standalone: true
})

export class WelcomeComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly configurationService = inject(ConfigurationService);
  private readonly cookieService = inject(CookieService);

  private readonly welcomeBannerStatusCookieKey = 'welcomebanner_status'

  ngOnInit (): void {
    const welcomeBannerStatus = this.cookieService.get(this.welcomeBannerStatusCookieKey)
    if (welcomeBannerStatus !== 'dismiss') {
      this.configurationService.getApplicationConfiguration().subscribe({
        next: (config: any) => {
          if (config?.application?.welcomeBanner && !config.application.welcomeBanner.showOnFirstStart) {
            return
          }
          this.dialog.open(WelcomeBannerComponent, {
            minWidth: '320px',
            width: '35%',
            position: {
              top: '50px'
            }
          })
        },
        error: (err) => { console.log(err) }
      })
    }
  }
}
