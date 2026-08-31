/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable, inject } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'
import { type GuestBasketQuantityViolation } from './basket.service'

@Injectable({
  providedIn: 'root'
})
export class SnackBarHelperService {
  private readonly translateService = inject(TranslateService)
  private readonly snackBar = inject(MatSnackBar)


  open (message: string, cssClass?: string) {
    this.translateService.get(message).subscribe({
      next: (translatedMessage) => {
        this.show(translatedMessage, cssClass)
      },
      error: () => {
        this.show(message, cssClass)
      }
    })
  }

  openBasketQuantityViolation (violation: GuestBasketQuantityViolation) {
    if (violation.type === 'limit') {
      this.translateService.get('BASKET_ADD_PRODUCT_LIMIT', { quantity: violation.limitPerUser }).subscribe({
        next: (translatedMessage) => {
          this.show(translatedMessage, 'errorBar')
        },
        error: () => {
          this.show('BASKET_ADD_PRODUCT_LIMIT', 'errorBar')
        }
      })
    } else {
      this.open('BASKET_ADD_PRODUCT_OUT_OF_STOCK', 'errorBar')
    }
  }

  private show (message: string, cssClass?: string) {
    this.snackBar.open(message, 'X', {
      duration: 5000,
      panelClass: [cssClass, 'mat-body']
    })
  }
}
