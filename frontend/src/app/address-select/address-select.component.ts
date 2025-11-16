/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, inject } from '@angular/core'
import { Router } from '@angular/router'
import { AddressComponent } from '../address/address.component'

@Component({
  selector: 'app-address-select',
  templateUrl: './address-select.component.html',
  styleUrls: ['./address-select.component.scss'],
  imports: [AddressComponent]
})
export class AddressSelectComponent {
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  public addressId: any = undefined
  public showNextButton = true

  getMessage (id) {
    this.addressId = id
  }
}
