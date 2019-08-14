import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { AddressService } from '../Services/address.service'
import { MatTableDataSource } from '@angular/material/table'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faTrashAlt, faEdit } from '@fortawesome/free-regular-svg-icons/'

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
  public breakpoint: number
  public confirmation: any
  public error: any
  public addressExist: Boolean = false

  constructor (private addressService: AddressService) { }

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
      this.confirmation = 'Your address has been removed.'
      this.load()
    }, (error) => {
      this.error = error.error
      this.confirmation = null
      console.log(error)
    })
  }
}
