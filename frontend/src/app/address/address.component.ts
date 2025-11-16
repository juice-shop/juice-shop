/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, EventEmitter, Input, type OnInit, Output, NgZone, inject } from '@angular/core'
import { AddressService } from '../Services/address.service'
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons/'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { Router, RouterLink } from '@angular/router'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { SelectionModel } from '@angular/cdk/collections'
import { MatIconModule } from '@angular/material/icon'
import { MatIconButton, MatButtonModule } from '@angular/material/button'
import { MatRadioButton } from '@angular/material/radio'

import { MatCardModule } from '@angular/material/card'

library.add(faEdit, faTrashAlt)

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  imports: [MatCardModule, TranslateModule, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatRadioButton, MatIconButton, RouterLink, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatButtonModule, MatIconModule]
})
export class AddressComponent implements OnInit {
  private readonly addressService = inject(AddressService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly snackBarHelperService = inject(SnackBarHelperService);

  @Output() emitSelection = new EventEmitter()
  @Input() public allowEdit = false
  @Input() public addNewAddressDiv = true
  @Input() public showNextButton = false
  public addressId: any = undefined
  public displayedColumns = ['Name', 'Address', 'Country']
  selection = new SelectionModel<Element>(false, [])
  public storedAddresses: any[]
  public dataSource
  public confirmation: any
  public error: any
  public addressExist = false

  ngOnInit (): void {
    if (this.allowEdit) {
      this.displayedColumns.push('Edit', 'Remove')
    } else {
      this.displayedColumns.unshift('Selection')
    }
    this.load()
  }

  load () {
    this.addressService.get().subscribe({
      next: (addresses) => {
        this.addressExist = addresses.length
        this.storedAddresses = addresses
        this.dataSource = new MatTableDataSource<Element>(this.storedAddresses)
      },
      error: (err) => {
        this.snackBarHelperService.open(err.error?.error, 'errorBar')
        console.log(err)
      }
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
    this.ngZone.run(async () => await this.router.navigate(['/delivery-method']))
  }

  deleteAddress (id: number) {
    this.addressService.del(id).subscribe({
      next: () => {
        this.error = null
        this.translate.get('ADDRESS_REMOVED').subscribe({
          next: (addressRemoved) => {
            this.snackBarHelperService.open(addressRemoved, 'confirmBar')
          },
          error: (translationId) => {
            this.snackBarHelperService.open(translationId, 'confirmBar')
          }
        })
        this.load()
      },
      error: (err) => {
        this.snackBarHelperService.open(err.error?.error, 'errorBar')
        console.log(err)
      }
    })
  }
}
