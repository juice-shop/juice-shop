import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { AddressService } from '../Services/address.service'
import { MatTableDataSource } from '@angular/material/table'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons/'
import { TranslateService } from '@ngx-translate/core'

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
  public displayedColumns = ['Name', 'Address', 'Country']
  public storedAddresses: any[]
  public dataSource
  public confirmation: any
  public error: any
  public addressExist: Boolean = false

  constructor (private addressService: AddressService, private translate: TranslateService) { }

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
    }, (error) => {
      this.error = error.error
      this.confirmation = null
      console.log(error)
    })
  }

  emitSelectionToParent (id: number) {
    this.emitSelection.emit(id)
  }

  deleteAddress (id: number) {
    this.addressService.del(id).subscribe(() => {
      this.error = null
      this.translate.get('ADDRESS_REMOVED').subscribe((addressRemoved) => {
        this.confirmation = addressRemoved
      }, (translationId) => {
        this.confirmation = translationId
      })
      this.load()
    }, (error) => {
      this.error = error.error
      this.confirmation = null
      console.log(error)
    })
  }
}
