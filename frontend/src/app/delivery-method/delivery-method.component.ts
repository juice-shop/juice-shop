/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, OnInit } from '@angular/core'
import { DeliveryService } from '../Services/delivery.service'
import { AddressService } from '../Services/address.service'
import { MatTableDataSource } from '@angular/material/table'
import { Router } from '@angular/router'
import { Location } from '@angular/common'
import { DeliveryMethod } from '../Models/deliveryMethod.model'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faRocket, faShippingFast, faTruck } from '@fortawesome/free-solid-svg-icons'
import { SelectionModel } from '@angular/cdk/collections'

library.add(faRocket, faShippingFast, faTruck)
dom.watch()

@Component({
  selector: 'app-delivery-method',
  templateUrl: './delivery-method.component.html',
  styleUrls: ['./delivery-method.component.scss']
})
export class DeliveryMethodComponent implements OnInit {
  public displayedColumns = ['Selection', 'Name', 'Price', 'ETA']
  public methods: DeliveryMethod[]
  public address: any
  public dataSource
  public deliveryMethodId: Number = undefined
  selection = new SelectionModel<DeliveryMethod>(false, [])

  constructor (private readonly location: Location, private readonly deliverySerivce: DeliveryService,
    private readonly addressService: AddressService, private readonly router: Router, private readonly ngZone: NgZone) { }

  ngOnInit () {
    this.addressService.getById(sessionStorage.getItem('addressId')).subscribe((address) => {
      this.address = address
    }, (error) => console.log(error))

    this.deliverySerivce.get().subscribe((methods) => {
      console.log(methods)
      this.methods = methods
      this.dataSource = new MatTableDataSource<DeliveryMethod>(this.methods)
    }, (error) => console.log(error))
  }

  selectMethod (id) {
    if (this.selection.hasValue() || id) {
      this.deliveryMethodId = id
    } else {
      this.deliveryMethodId = undefined
    }
  }

  routeToPreviousUrl () {
    this.location.back()
  }

  chooseDeliveryMethod () {
    sessionStorage.setItem('deliveryMethodId', this.deliveryMethodId.toString())
    this.ngZone.run(async () => await this.router.navigate(['/payment', 'shop']))
  }
}
