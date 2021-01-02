/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { CookieService } from 'ngx-cookie-service'
import { WindowRefService } from '../Services/window-ref.service'
import { Router } from '@angular/router'
import { Component, NgZone, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { UserService } from '../Services/user.service'
import { faEye, faEyeSlash, faKey } from '@fortawesome/free-solid-svg-icons'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { ConfigurationService } from '../Services/configuration.service'
import { BasketService } from '../Services/basket.service'

library.add(faKey, faEye, faEyeSlash, faGoogle)
dom.watch()

const oauthProviderUrl = 'https://accounts.google.com/o/oauth2/v2/auth'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public emailControl = new FormControl('', [Validators.required])
  public passwordControl = new FormControl('', [Validators.required])
  public hide = true
  public user: any
  public rememberMe: FormControl = new FormControl(false)
  public error: any
  public clientId = '1005568560502-6hm16lef8oh46hr2d98vf2ohlnj4nfhq.apps.googleusercontent.com'
  public oauthUnavailable: boolean = true
  public redirectUri: string = ''
  constructor (private readonly configurationService: ConfigurationService, private readonly userService: UserService, private readonly windowRefService: WindowRefService, private readonly cookieService: CookieService, private readonly router: Router, private readonly formSubmitService: FormSubmitService, private readonly basketService: BasketService, private readonly ngZone: NgZone) { }

  ngOnInit () {
    const email = localStorage.getItem('email')
    if (email) {
      this.user = {}
      this.user.email = email
      this.rememberMe.setValue(true)
    } else {
      this.rememberMe.setValue(false)
    }

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    this.redirectUri = `${this.windowRefService.nativeWindow.location.protocol}//${this.windowRefService.nativeWindow.location.host}`
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config?.application?.googleOauth) {
        this.clientId = config.application.googleOauth.clientId
        const authorizedRedirect = config.application.googleOauth.authorizedRedirects.find(r => r.uri === this.redirectUri)
        if (authorizedRedirect) {
          this.oauthUnavailable = false
          this.redirectUri = authorizedRedirect.proxy ? authorizedRedirect.proxy : authorizedRedirect.uri
        } else {
          this.oauthUnavailable = true
          console.log(this.redirectUri + ' is not an authorized redirect URI for this application.')
        }
      }
    }, (err) => console.log(err))

    this.formSubmitService.attachEnterKeyHandler('login-form', 'loginButton', () => this.login())
  }

  login () {
    this.user = {}
    this.user.email = this.emailControl.value
    this.user.password = this.passwordControl.value
    this.userService.login(this.user).subscribe((authentication: any) => {
      localStorage.setItem('token', authentication.token)
      const expires = new Date()
      expires.setHours(expires.getHours() + 8)
      this.cookieService.set('token', authentication.token, expires, '/')
      sessionStorage.setItem('bid', authentication.bid)
      this.basketService.updateNumberOfCartItems()
      this.userService.isLoggedIn.next(true)
      this.ngZone.run(async () => await this.router.navigate(['/search']))
    }, ({ error }) => {
      if (error.status && error.data && error.status === 'totp_token_required') {
        localStorage.setItem('totp_tmp_token', error.data.tmpToken)
        this.ngZone.run(async () => await this.router.navigate(['/2fa/enter']))
        return
      }
      localStorage.removeItem('token')
      this.cookieService.delete('token', '/')
      sessionStorage.removeItem('bid')
      this.error = error
      this.userService.isLoggedIn.next(false)
      this.emailControl.markAsPristine()
      this.passwordControl.markAsPristine()
    })

    if (this.rememberMe.value) {
      localStorage.setItem('email', this.user.email)
    } else {
      localStorage.removeItem('email')
    }

    if (this.error && this.user.email && this.user.email.match(/support@.*/)) {
      console.log('@echipa de suport: Secretul nostru comun este încă Caoimhe cu parola de master gol!')
    }
  }

  googleLogin () {
    this.windowRefService.nativeWindow.location.replace(`${oauthProviderUrl}?client_id=${this.clientId}&response_type=token&scope=email&redirect_uri=${this.redirectUri}`)
  }
}
