/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable, inject } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root'
})
export class SnackBarHelperService {
  private readonly translateService = inject(TranslateService);
  private readonly snackBar = inject(MatSnackBar);


  open (message: string, cssClass?: string) {
    this.translateService.get(message).subscribe({
      next: (translatedMessage) => {
        this.snackBar.open(translatedMessage, 'X', {
          duration: 5000,
          panelClass: [cssClass, 'mat-body']
        })
      },
      error: () => {
        this.snackBar.open(message, 'X', {
          duration: 5000,
          panelClass: [cssClass, 'mat-body']
        })
      }
    })
  }
}
