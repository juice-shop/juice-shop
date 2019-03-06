import { Component } from '@angular/core'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import * as jwt_decode from 'jwt-decode'

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent {
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
    payload = jwt_decode(localStorage.getItem('token'))
    if (payload.data.lastLoginIp) {
      this.Ip = payload.data.lastLoginIp
    } else {
      window.alert('Login Is Required')
      this.Ip = 'Login Required'
    }
  }
}
