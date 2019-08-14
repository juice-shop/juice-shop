import { Component } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'app-address-select',
  templateUrl: './address-select.component.html',
  styleUrls: ['./address-select.component.scss']
})
export class AddressSelectComponent {
  public addressId: any = undefined

  constructor (private router: Router) {}

  getMessage (id) {
    this.addressId = id
  }

  chooseAddress () {
    sessionStorage.setItem('addressId', this.addressId)
    this.router.navigate(['/delivery-method'])
  }
}
