/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy, signal } from '@angular/core'
import { AddressComponent } from '../address/address.component'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-address-select',
  templateUrl: './address-select.component.html',
  styleUrls: ['./address-select.component.scss'],
  imports: [AddressComponent]
})
export class AddressSelectComponent {
  public readonly showNextButton = true
  public readonly addressId = signal<number | undefined>(undefined)

  getMessage (id) {
    this.addressId.set(id)
  }
}
