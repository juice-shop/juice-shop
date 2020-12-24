/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root'
})
export class SnackBarHelperService {
  constructor (private readonly translateService: TranslateService,
    private readonly snackBar: MatSnackBar) { }

  open (message: string, cssClass?: string) {
    this.translateService.get(message).subscribe((translatedMessage) => {
      this.snackBar.open(translatedMessage, 'X', {
        duration: 5000,
        panelClass: cssClass
      })
    }, () => {
      this.snackBar.open(message, 'X', {
        duration: 5000,
        panelClass: cssClass
      })
    })
  }
}
