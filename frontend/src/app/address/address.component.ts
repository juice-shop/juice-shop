/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, NgZone, ChangeDetectionStrategy, computed, inject, input, output, signal } from '@angular/core'
import { AddressService } from '../Services/address.service'
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table'
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
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  imports: [MatCardModule, TranslateModule, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatRadioButton, MatIconButton, RouterLink, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatButtonModule, MatIconModule]
})
export class AddressComponent implements OnInit {
  private readonly addressService = inject(AddressService)
  private readonly translate = inject(TranslateService)
  private readonly router = inject(Router)
  private readonly ngZone = inject(NgZone)
  private readonly snackBarHelperService = inject(SnackBarHelperService)

  public readonly allowEdit = input(false)
  public readonly addNewAddressDiv = input(true)
  public readonly showNextButton = input(false)

  public readonly emitSelection = output<number | undefined>()

  public readonly addresses = signal<any[]>([])
  public readonly addressExist = computed(() => this.addresses().length > 0)
  public readonly addressId = signal<number | undefined>(undefined)
  public readonly selection = new SelectionModel<Element>(false, [])

  public readonly displayedColumns = computed(() => {
    const columns = ['Name', 'Address', 'Country']
    return this.allowEdit() ? [...columns, 'Edit', 'Remove'] : ['Selection', ...columns]
  })

  ngOnInit (): void {
    this.load()
  }

  load () {
    this.addressService.get().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses)
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
      this.addressId.set(id)
    } else {
      this.emitSelection.emit(undefined)
      this.addressId.set(undefined)
    }
  }

  chooseAddress () {
    sessionStorage.setItem('addressId', String(this.addressId()))
    this.ngZone.run(async () => await this.router.navigate(['/delivery-method']))
  }

  deleteAddress (id: number) {
    this.addressService.del(id).subscribe({
      next: () => {
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
