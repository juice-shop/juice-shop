/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, type OnInit } from '@angular/core'
import { DeliveryService } from '../Services/delivery.service'
import { AddressService } from '../Services/address.service'
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table'
import { Router } from '@angular/router'
import { Location, NgClass } from '@angular/common'
import { type DeliveryMethod } from '../Models/deliveryMethod.model'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faRocket, faShippingFast, faTruck } from '@fortawesome/free-solid-svg-icons'
import { SelectionModel } from '@angular/cdk/collections'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'

import { MatRadioButton } from '@angular/material/radio'

import { MatDivider } from '@angular/material/divider'
import { TranslateModule } from '@ngx-translate/core'
import { MatCardModule } from '@angular/material/card'

library.add(faRocket, faShippingFast, faTruck)

@Component({
  selector: 'app-delivery-method',
  templateUrl: './delivery-method.component.html',
  styleUrls: ['./delivery-method.component.scss'],
  imports: [MatCardModule, TranslateModule, MatDivider, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatRadioButton, NgClass, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatButtonModule, MatIconModule]
})
export class DeliveryMethodComponent implements OnInit {
  public displayedColumns = ['Selection', 'Name', 'Price', 'ETA']
  public methods: DeliveryMethod[]
  public address: any
  public dataSource
  public deliveryMethodId: number = undefined
  selection = new SelectionModel<DeliveryMethod>(false, [])

  constructor (private readonly location: Location, private readonly deliverySerivce: DeliveryService,
    private readonly addressService: AddressService, private readonly router: Router, private readonly ngZone: NgZone) { }

  ngOnInit (): void {
    this.addressService.getById(sessionStorage.getItem('addressId')).subscribe({
      next: (address) => {
        this.address = address
      },
      error: (error) => { console.log(error) }
    })

    this.deliverySerivce.get().subscribe({
      next: (methods) => {
        console.log(methods)
        this.methods = methods
        this.dataSource = new MatTableDataSource<DeliveryMethod>(this.methods)
      },
      error: (error) => { console.log(error) }
    })
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
