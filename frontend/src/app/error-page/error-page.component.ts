/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateService } from '@ngx-translate/core'
import { Component, type OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserSlash, faHandPaper } from '@fortawesome/free-solid-svg-icons'
import { MatCardModule } from '@angular/material/card'

library.add(faUserSlash, faHandPaper)

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss'],
  imports: [MatCardModule]
})
export class ErrorPageComponent implements OnInit {
  public error: string | null = null

  constructor (private readonly route: ActivatedRoute, private readonly translate: TranslateService) {
  }

  ngOnInit (): void {
    const errorKey = this.route.snapshot.queryParams.error
    if (errorKey) {
      this.translate.get(errorKey).subscribe({
        next: (errorMessage) => {
          this.error = errorMessage
        },
        error: (translationId) => {
          this.error = translationId
        }
      })
    }
  }
}
