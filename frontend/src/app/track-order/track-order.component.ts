import { Router } from '@angular/router'
import { FormControl, Validators } from '@angular/forms'
import { Component } from '@angular/core'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faMapMarker } from '@fortawesome/free-solid-svg-icons'

library.add(faMapMarker)
dom.watch()

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
