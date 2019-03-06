import { Component } from '@angular/core'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import * as jwt_decode from 'jwt-decode'

@Component({
  selector: 'app-privacy-security',
  templateUrl: './privacy-security.component.html',
  styleUrls: ['./privacy-security.component.scss']
})
export class PrivacySecurityComponent {
  Ip: string
  windowWidth: number = window.innerWidth
  ngOnInit () {
    this.getIp()
  }
  ngAfterViewInit () {
    this.windowWidth = window.innerWidth
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    )

  constructor (private breakpointObserver: BreakpointObserver) {}
  selectedIndex = 1

  showDiv (index: number) {
    this.selectedIndex = index
  }

  getIp () {
    let payload = {} as any
    if (localStorage.getItem('token')) {
      payload = jwt_decode(localStorage.getItem('token'))
      if (payload.data.lastLoginIp) {
        this.Ip = payload.data.lastLoginIp
      } else {
        window.alert('Login Is Required')
        this.Ip = 'Login Required'
      }
    } else {
      this.Ip = 'Token is Not Present'
    }
  }
}
