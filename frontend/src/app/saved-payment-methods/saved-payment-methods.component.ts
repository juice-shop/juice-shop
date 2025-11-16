/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component } from '@angular/core'
import { PaymentMethodComponent } from '../payment-method/payment-method.component'
import { MatCardModule } from '@angular/material/card'

@Component({
  selector: 'app-saved-payment-methods',
  templateUrl: './saved-payment-methods.component.html',
  styleUrls: ['./saved-payment-methods.component.scss'],
  imports: [MatCardModule, PaymentMethodComponent]
})

export class SavedPaymentMethodsComponent {
}
