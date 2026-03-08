/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ActivatedRoute, Router } from '@angular/router'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngy-cookie'
import { Component, NgZone, type OnInit, inject } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { MatCardModule } from '@angular/material/card'
import { BasketService } from '../Services/basket.service'

@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss'],
  imports: [MatCardModule, TranslateModule]
})
export class OAuthComponent implements OnInit {
  private readonly cookieService = inject(CookieService)
  private readonly userService = inject(UserService)
  private readonly basketService = inject(BasketService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly ngZone = inject(NgZone)


  ngOnInit (): void {
    this.userService.oauthLogin(this.parseRedirectUrlParams().access_token).subscribe({
      next: (profile: any) => {
        const password = btoa(profile.email.split('').reverse().join(''))
        this.userService.save({ email: profile.email, password, passwordRepeat: password }).subscribe({
          next: () => {
            this.login(profile)
          },
          error: () => { this.login(profile) }
        })
      },
      error: (error) => {
        this.invalidateSession(error)
        this.ngZone.run(async () => await this.router.navigate(['/login']))
      }
    })
  }

  login (profile: any) {
    this.userService.login({ email: profile.email, password: btoa(profile.email.split('').reverse().join('')), oauth: true }).subscribe({
      next: async (authentication) => {
        const expires = new Date()
        expires.setHours(expires.getHours() + 8)
        this.cookieService.put('token', authentication.token, { expires })
        localStorage.setItem('token', authentication.token)
        sessionStorage.setItem('bid', authentication.bid)
        try {
          await this.basketService.syncGuestBasketItems()
        } catch (err) {
          console.log(err)
        }
        this.basketService.updateNumberOfCartItems()
        this.userService.isLoggedIn.next(true)
        this.ngZone.run(async () => await this.router.navigate(['/']))
      },
      error: (error) => {
        this.invalidateSession(error)
        this.ngZone.run(async () => await this.router.navigate(['/login']))
      }
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
    for (const part of splitted) {
      const [key, value] = part.split('=')
      params[key] = value
    }
    return params
  }
}
