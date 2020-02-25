/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
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

  constructor (private router: Router, private ngZone: NgZone) {}

  getMessage (id) {
    this.addressId = id
  }

  chooseAddress () {
    sessionStorage.setItem('addressId', this.addressId)
    this.ngZone.run(() => this.router.navigate(['/delivery-method']))
  }
}
