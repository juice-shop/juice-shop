/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone } from '@angular/core'
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
  public productCount: number = 0
  public bonus: number = 0

  constructor (private readonly router: Router, private readonly ngZone: NgZone) {}

  checkout () {
    this.ngZone.run(async () => await this.router.navigate(['/address/select']))
  }

  getProductCount (total) {
    this.productCount = total
  }

  getBonusPoints (total) {
    sessionStorage.setItem('itemTotal', total[0])
    this.bonus = total[1]
  }
}
