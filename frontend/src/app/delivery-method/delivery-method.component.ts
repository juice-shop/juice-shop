import { Component, OnInit } from '@angular/core'
import { DeliveryService } from '../Services/delivery.service'
import { AddressService } from '../Services/address.service'
import { MatTableDataSource } from '@angular/material/table'
import { Router } from '@angular/router'
import { DeliveryMethod } from '../Models/deliveryMethod.model'

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

  constructor (private deliverySerivce: DeliveryService, private addressService: AddressService, private router: Router) { }

  ngOnInit () {
    this.addressService.getById(sessionStorage.getItem('addressId')).subscribe((address) => {
      this.address = address
    }, (error) => console.log(error))

    this.deliverySerivce.get().subscribe((methods) => {
      this.methods = methods
      this.dataSource = new MatTableDataSource<DeliveryMethod>(this.methods)
    }, (error) => console.log(error))
  }

  selectMethod (id) {
    this.deliveryMethodId = id
  }

  chooseDeliveryMethod () {
    sessionStorage.setItem('deliveryMethodId', this.deliveryMethodId.toString())
    this.router.navigate(['/payment', 'shop'])
  }
}
