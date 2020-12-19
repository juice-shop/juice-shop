/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'app-address-select',
  templateUrl: './address-select.component.html',
  styleUrls: ['./address-select.component.scss']
})
export class AddressSelectComponent {
  public addressId: any = undefined
  public showNextButton: boolean = true

  constructor (private router: Router, private ngZone: NgZone) {}

  getMessage (id) {
    this.addressId = id
  }

}
