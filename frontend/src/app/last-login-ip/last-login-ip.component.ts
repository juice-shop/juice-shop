import { Component } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import * as jwt_decode from 'jwt-decode'

@Component({
  selector: 'app-last-login-ip',
  templateUrl: './last-login-ip.component.html',
  styleUrls: ['./last-login-ip.component.scss']

})

export class LastLoginIpComponent {

  lastLoginIp: any = '?'
  constructor (private sanitizer: DomSanitizer) {}

  ngOnInit () {
    try {
      this.parseAuthToken()
    } catch (err) {
      console.log(err)
    }
  }

  parseAuthToken () {
    let payload = {} as any
    const token = localStorage.getItem('token')
    if (token) {
      payload = jwt_decode(token)
      if (payload.data.lastLoginIp) {
        this.lastLoginIp = this.sanitizer.bypassSecurityTrustHtml(`<small>${payload.data.lastLoginIp}</small>`)
      }
    }
  }

}
