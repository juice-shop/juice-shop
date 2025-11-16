/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, inject } from '@angular/core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCartArrowDown } from '@fortawesome/free-solid-svg-icons'
import { Router } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { PurchaseBasketComponent } from '../purchase-basket/purchase-basket.component'
import { MatCardModule } from '@angular/material/card'

library.add(faCartArrowDown)

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss'],
  imports: [MatCardModule, PurchaseBasketComponent, MatButtonModule, TranslateModule]
})
export class BasketComponent {
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  public productCount = 0
  public bonus = 0

  checkout (): void {
    this.ngZone.run(async () => await this.router.navigate(['/address/select']))
  }

  getProductCount (total: number): void {
    this.productCount = total
  }

  getBonusPoints (total: [number, number]): void {
    sessionStorage.setItem('itemTotal', total[0].toString())
    this.bonus = total[1]
  }
}
