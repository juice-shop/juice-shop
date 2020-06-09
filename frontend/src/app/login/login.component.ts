/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
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
  public failedLoginCount: number
  public isCaptchaRequired: boolean
  constructor (private configurationService: ConfigurationService, private userService: UserService, private windowRefService: WindowRefService, private cookieService: CookieService, private router: Router, private formSubmitService: FormSubmitService, private ngZone: NgZone) { }

  ngOnInit () {
    const failedLoginCount = parseInt(localStorage.getItem('failedLoginCount'), 10)
    console.log('ngOnInit: localStorage value: ' + failedLoginCount)
    console.log('ngOnInit: is this bastard equal null?: ' + failedLoginCount === null)
    if (Number.isNaN(failedLoginCount)) {
      this.failedLoginCount = 0
      localStorage.setItem('failedLoginCount', this.failedLoginCount.toString(10))
    } else {
      this.failedLoginCount = failedLoginCount
    }
    console.log('ngOnInit: failedLoginCount: ' + this.failedLoginCount)
    this.isCaptchaRequired = this.captchaRequired()
    const email = localStorage.getItem('email')
    if (email) {
      this.user = {}
      this.user.email = email
      this.rememberMe.setValue(true)
    } else {
      this.rememberMe.setValue(false)
    }

    this.redirectUri = this.windowRefService.nativeWindow.location.protocol + '//' + this.windowRefService.nativeWindow.location.host
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config && config.application && config.application.googleOauth) {
        this.clientId = config.application.googleOauth.clientId
        let authorizedRedirect = config.application.googleOauth.authorizedRedirects.find(r => r.uri === this.redirectUri)
        if (authorizedRedirect) {
          this.oauthUnavailable = false
          this.redirectUri = authorizedRedirect.proxy ? authorizedRedirect.proxy : authorizedRedirect.uri
        } else {
          this.oauthUnavailable = true
          console.log(this.redirectUri + ' is not an authorized redirect URI for this application.')
        }

      }
    },(err) => console.log(err))

    this.formSubmitService.attachEnterKeyHandler('login-form', 'loginButton', () => this.login())

  }

  login () {
    this.user = {}
    this.user.email = this.emailControl.value
    this.user.password = this.passwordControl.value
    this.userService.login(this.user).subscribe((authentication: any) => {
      if (this.captchaRequired()) {
        const captchaResponse: any = document.getElementById('g-recaptcha-response')
        if (captchaResponse.value === '') {
          this.error = Error('Invalid Captcha!')
          return
          // throw Error('Invalid Captcha!')
        }
      }
      localStorage.setItem('token', authentication.token)
      let expires = new Date()
      expires.setHours(expires.getHours() + 8)
      this.cookieService.set('token', authentication.token, expires, '/')
      localStorage.removeItem('failedLoginCount')
      sessionStorage.setItem('bid', authentication.bid)
      this.userService.isLoggedIn.next(true)
      this.ngZone.run(() => this.router.navigate(['/search']))
    }, ({ error }) => {
      if (error.status && error.data && error.status === 'totp_token_required') {
        localStorage.setItem('totp_tmp_token', error.data.tmpToken)
        this.ngZone.run(() => this.router.navigate(['/2fa/enter']))
        return
      }
      localStorage.removeItem('token')
      this.cookieService.delete('token', '/')
      sessionStorage.removeItem('bid')
      this.error = error
      console.log('Error: ' + error)
      this.userService.isLoggedIn.next(false)
      this.emailControl.markAsPristine()
      this.passwordControl.markAsPristine()
      this.incrementFailedLoginCount()
    })

    if (this.rememberMe.value) {
      localStorage.setItem('email', this.user.email)
    } else {
      localStorage.removeItem('email')
    }

    if (this.error && this.user.email && this.user.email.match(/support@.*/)) {
      console.log('@echipa de suport: Secretul nostru comun este încă Caoimhe cu parola de master gol!')
    }

    if (this.error && this.captchaRequired()) {
      location.reload()
    }
  }

  googleLogin () {
    this.windowRefService.nativeWindow.location.replace(`${oauthProviderUrl}?client_id=${this.clientId}&response_type=token&scope=email&redirect_uri=${this.redirectUri}`)
  }

  incrementFailedLoginCount () {
    this.failedLoginCount++
    console.log('Failed loggin attempt no.' + this.failedLoginCount)
    localStorage.setItem('failedLoginCount', this.failedLoginCount.toString(10))
  }

  captchaRequired () {
    console.log('captchaRequiredCalled')
    console.log(this.failedLoginCount > 3)
    return this.failedLoginCount > 3
  }

}
