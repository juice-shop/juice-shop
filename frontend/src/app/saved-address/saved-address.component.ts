import { Component } from '@angular/core'
import { AddressComponent } from '../address/address.component'

@Component({
  selector: 'app-saved-address',
  templateUrl: './saved-address.component.html',
  styleUrls: ['./saved-address.component.scss'],
  imports: [AddressComponent]
})

export class SavedAddressComponent {
}
