import { Router, ActivatedRoute } from '@angular/router'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngx-cookie'
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss']
})
export class OAuthComponent implements OnInit {

  constructor (private cookieService: CookieService, private userService: UserService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit () {
    console.log(this.route.snapshot.data)
    this.userService.oauthLogin(this.parseRedirectUrlParams()['access_token']).subscribe((profile: any) => {
      this.userService.save({ email: profile.email, password: btoa(profile.email) }).subscribe(() => {
        this.login(profile)
      }, () => this.login(profile))
    }, (error) => {
      this.invalidateSession(error)
      this.router.navigate(['/login'])
    })
  }

  login (profile) {
    this.userService.login({ email: profile.email, password: btoa(profile.email), oauth: true }).subscribe((authentication) => {
      this.cookieService.put('token', authentication.token)
      sessionStorage.setItem('bid', authentication.bid)
      localStorage.setItem('token', authentication.token)
      this.userService.isLoggedIn.next(true)
      this.router.navigate(['/'])
    }, (error) => {
      this.invalidateSession(error)
      this.router.navigate(['/login'])
    })
  }

  invalidateSession (error) {
    console.log(error)
    this.cookieService.remove('token', { domain: document.domain })
    localStorage.removeItem('token')
    sessionStorage.removeItem('bid')
  }

  parseRedirectUrlParams () {
    let hash = this.route.snapshot.data.params.substr(1)
    let splitted = hash.split('&')
    let params = {}
    for (let i = 0; i < splitted.length; i++) {
      let param = splitted[ i ].split('=')
      let key = param[ 0 ]
      params[ key ] = param[ 1 ]
    }
    console.log(params)
    return params
  }
}
