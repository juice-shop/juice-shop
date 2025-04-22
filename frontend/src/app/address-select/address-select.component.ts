/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone } from '@angular/core'
import { Router } from '@angular/router'
import { AddressComponent } from '../address/address.component'

@Component({
  selector: 'app-address-select',
  templateUrl: './address-select.component.html',
  styleUrls: ['./address-select.component.scss'],
  imports: [AddressComponent]
})
export class AddressSelectComponent {
  public addressId: any = undefined
  public showNextButton: boolean = true

  constructor (private readonly router: Router, private readonly ngZone: NgZone) {}

  getMessage (id) {
    this.addressId = id
  }
}
