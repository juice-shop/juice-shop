/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { Component, EventEmitter, Input, OnInit, Output, NgZone } from '@angular/core'
import { AddressService } from '../Services/address.service'
import { MatTableDataSource } from '@angular/material/table'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons/'
import { TranslateService } from '@ngx-translate/core'
import { Router } from '@angular/router'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { SelectionModel } from '@angular/cdk/collections'

library.add(faEdit, faTrashAlt)
dom.watch()

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {

  @Output() emitSelection = new EventEmitter()
  @Input('allowEdit') public allowEdit: Boolean = false
  @Input('addNewAddressDiv') public addNewAddressDiv: Boolean = true
  @Input('showNextButton') public showNextButton: boolean = false
  public addressId: any = undefined
  public displayedColumns = ['Name', 'Address', 'Country']
  selection = new SelectionModel<Element>(false, [])
  public storedAddresses: any[]
  public dataSource
  public confirmation: any
  public error: any
  public addressExist: Boolean = false

  constructor (private addressService: AddressService, private translate: TranslateService,
    private router: Router, private ngZone: NgZone, private snackBarHelperService: SnackBarHelperService) { }

  ngOnInit () {
    if (this.allowEdit) {
      this.displayedColumns.push('Edit', 'Remove')
    } else {
      this.displayedColumns.unshift('Selection')
    }
    this.load()
  }

  load () {
    this.addressService.get().subscribe((addresses) => {
      this.addressExist = addresses.length
      this.storedAddresses = addresses
      this.dataSource = new MatTableDataSource<Element>(this.storedAddresses)
    }, (err) => {
      this.snackBarHelperService.open(err.error?.error,'errorBar')
      console.log(err)
    })
  }

  emitSelectionToParent (id: number) {
    if (this.selection.hasValue()) {
      this.emitSelection.emit(id)
      this.addressId = id
    } else {
      this.emitSelection.emit(undefined)
      this.addressId = undefined
    }
  }

  chooseAddress () {
    sessionStorage.setItem('addressId', this.addressId)
    this.ngZone.run(() => this.router.navigate(['/delivery-method']))
  }

  deleteAddress (id: number) {
    this.addressService.del(id).subscribe(() => {
      this.error = null
      this.translate.get('ADDRESS_REMOVED').subscribe((addressRemoved) => {
        this.snackBarHelperService.open(addressRemoved,'confirmBar')
      }, (translationId) => {
        this.snackBarHelperService.open(translationId,'confirmBar')
      })
      this.load()
    }, (err) => {
      this.snackBarHelperService.open(err.error?.error,'errorBar')
      console.log(err)
    })
  }
}
