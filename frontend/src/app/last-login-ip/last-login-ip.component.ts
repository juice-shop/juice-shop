import { Component } from '@angular/core'
import * as jwt_decode from 'jwt-decode'

@Component({
  selector: 'app-last-login-ip',
  templateUrl: './last-login-ip.component.html',
  styleUrls: ['./last-login-ip.component.scss']

})

export class LastLoginIpComponent {

  lastLoginIp: string = '?'

  ngOnInit () {
    this.parseAuthToken()
  }

  parseAuthToken () {
    let payload = {} as any
    if (localStorage.getItem('token')) {
      payload = jwt_decode(localStorage.getItem('token'))
      if (payload.data.lastLoginIp) {
        this.lastLoginIp = payload.data.lastLoginIp
      }
    }
  }

}
