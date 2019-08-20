import { ActivatedRoute, Router } from '@angular/router'
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
    this.userService.oauthLogin(this.parseRedirectUrlParams()['access_token']).subscribe((profile: any) => {
      let password = btoa(profile.email.split('').reverse().join(''))
      this.userService.save({ email: profile.email, password: password, passwordRepeat: password }).subscribe(() => {
        this.login(profile)
      }, () => this.login(profile))
    }, (error) => {
      this.invalidateSession(error)
      this.router.navigate(['/login'])
    })
  }

  login (profile: any) {
    this.userService.login({ email: profile.email, password: btoa(profile.email.split('').reverse().join('')), oauth: true }).subscribe((authentication) => {
      this.cookieService.put('token', authentication.token)
      localStorage.setItem('token', authentication.token)
      sessionStorage.setItem('bid', authentication.bid)
      this.userService.isLoggedIn.next(true)
      this.router.navigate(['/'])
    }, (error) => {
      this.invalidateSession(error)
      this.router.navigate(['/login'])
    })
  }

  invalidateSession (error: Error) {
    console.log(error)
    this.cookieService.remove('token')
    localStorage.removeItem('token')
    sessionStorage.removeItem('bid')
  }

  parseRedirectUrlParams () {
    let hash = this.route.snapshot.data.params.substr(1)
    let splitted = hash.split('&')
    let params: any = {}
    for (let i = 0; i < splitted.length; i++) {
      let param: string = splitted[ i ].split('=')
      let key: string = param[ 0 ]
      params[ key ] = param[ 1 ]
    }
    return params
  }
}
