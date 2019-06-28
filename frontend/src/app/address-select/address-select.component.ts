import { Component } from '@angular/core'

@Component({
  selector: 'app-address-select',
  templateUrl: './address-select.component.html',
  styleUrls: ['./address-select.component.scss']
})
export class AddressSelectComponent {
  public addressId: any = undefined

  getMessage (id) {
    this.addressId = id
  }

  chooseAddress () {
    sessionStorage.setItem('paymentId', this.addressId)
  }
}
