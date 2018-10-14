import { Router } from '@angular/router'
import { FormControl, Validators } from '@angular/forms'
import { Component } from '@angular/core'
import fontawesome from '@fortawesome/fontawesome'
import { faMapMarker } from '@fortawesome/fontawesome-free-solid'

fontawesome.library.add(faMapMarker)

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.component.html',
  styleUrls: ['./track-order.component.scss']
})
export class TrackOrderComponent {

  public orderIdControl: FormControl = new FormControl('', [Validators.required])
  constructor (private router: Router) { }

  save () {
    this.router.navigate(['/track-result'], {
      queryParams: {
        id: this.orderIdControl.value
      }
    })
  }

}
