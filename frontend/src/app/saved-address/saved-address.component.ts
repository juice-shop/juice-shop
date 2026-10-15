/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy } from '@angular/core'
import { AddressComponent } from '../address/address.component'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-saved-address',
  templateUrl: './saved-address.component.html',
  styleUrls: ['./saved-address.component.scss'],
  imports: [AddressComponent]
})

export class SavedAddressComponent {
}
