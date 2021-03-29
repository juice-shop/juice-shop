/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { ActivatedRoute, Router } from '@angular/router'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngx-cookie'
import { Component, NgZone, OnInit } from '@angular/core'

@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss']
})
export class OAuthComponent implements OnInit {
  constructor (private readonly cookieService: CookieService, private readonly userService: UserService, private readonly router: Router, private readonly route: ActivatedRoute, private readonly ngZone: NgZone) { }

  ngOnInit () {
    this.userService.oauthLogin(this.parseRedirectUrlParams().access_token).subscribe((profile: any) => {
      const password = btoa(profile.email.split('').reverse().join(''))
      this.userService.save({ email: profile.email, password: password, passwordRepeat: password }).subscribe(() => {
        this.login(profile)
      }, () => this.login(profile))
    }, (error) => {
      this.invalidateSession(error)
      this.ngZone.run(async () => await this.router.navigate(['/login']))
    })
  }

  login (profile: any) {
    this.userService.login({ email: profile.email, password: btoa(profile.email.split('').reverse().join('')), oauth: true }).subscribe((authentication) => {
      const expires = new Date()
      expires.setHours(expires.getHours() + 8)
      this.cookieService.put('token', authentication.token, { expires })
      localStorage.setItem('token', authentication.token)
      sessionStorage.setItem('bid', authentication.bid)
      this.userService.isLoggedIn.next(true)
      this.ngZone.run(async () => await this.router.navigate(['/']))
    }, (error) => {
      this.invalidateSession(error)
      this.ngZone.run(async () => await this.router.navigate(['/login']))
    })
  }

  invalidateSession (error: Error) {
    console.log(error)
    this.cookieService.remove('token')
    localStorage.removeItem('token')
    sessionStorage.removeItem('bid')
  }

  parseRedirectUrlParams () {
    const hash = this.route.snapshot.data.params.substr(1)
    const splitted = hash.split('&')
    const params: any = {}
    for (let i = 0; i < splitted.length; i++) {
      const param: string = splitted[i].split('=')
      const key: string = param[0]
      params[key] = param[1]
    }
    return params
  }
}
