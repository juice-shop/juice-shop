/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, inject } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { ConfigurationService } from '../Services/configuration.service'
import { MatDivider } from '@angular/material/divider'
import { TranslateModule } from '@ngx-translate/core'
import { MatCardModule } from '@angular/material/card'

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  imports: [MatCardModule, TranslateModule, MatDivider]
})
export class PrivacyPolicyComponent implements OnInit {
  private readonly _document = inject<HTMLDocument>(DOCUMENT);
  private readonly configurationService = inject(ConfigurationService);

  public applicationName = 'OWASP Juice Shop'
  public privacyContactEmail!: string
  public applicationUrl!: string

  ngOnInit (): void {
    this.applicationUrl = this._document.location.protocol + '//' + this._document.location.hostname
    this.configurationService.getApplicationConfiguration().subscribe({
      next: (config: any) => {
        if (config?.application?.name) {
          this.applicationName = config.application.name
        }
        if (config?.application?.privacyContactEmail) {
          this.privacyContactEmail = config.application.privacyContactEmail
        } else {
          this.privacyContactEmail = `donotreply@${this._document.location.hostname}`
        }
      },
      error: (err) => { console.log(err) }
    })
  }
}
