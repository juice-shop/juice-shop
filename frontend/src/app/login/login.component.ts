/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { CookieService } from 'ngy-cookie'
import { WindowRefService } from '../Services/window-ref.service'
import { Router, RouterLink } from '@angular/router'
import { Component, NgZone, type OnInit } from '@angular/core'
import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { library } from '@fortawesome/fontawesome-svg-core'
import { UserService } from '../Services/user.service'
import { faEye, faEyeSlash, faKey } from '@fortawesome/free-solid-svg-icons'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { ConfigurationService } from '../Services/configuration.service'
import { BasketService } from '../Services/basket.service'
import { MatCheckbox } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { MatIconButton, MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { TranslateModule } from '@ngx-translate/core'
import { MatFormFieldModule, MatLabel, MatError, MatSuffix } from '@angular/material/form-field'

import { MatCardModule } from '@angular/material/card'

library.add(faKey, faEye, faEyeSlash, faGoogle)

const oauthProviderUrl = 'https://accounts.google.com/o/oauth2/v2/auth'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [MatCardModule, MatFormFieldModule, MatLabel, TranslateModule, MatInputModule, FormsModule, ReactiveFormsModule, MatError, MatIconButton, MatSuffix, MatTooltip, RouterLink, MatButtonModule, MatIconModule, MatCheckbox]
})

export class LoginComponent implements OnInit {
  public emailControl = new UntypedFormControl('', [Validators.required])

  public passwordControl = new UntypedFormControl('', [Validators.required, Validators.minLength(1)])

  public hide = true
  public user: any
  public rememberMe: UntypedFormControl = new UntypedFormControl(false)
  public error: any
  public clientId = '1005568560502-6hm16lef8oh46hr2d98vf2ohlnj4nfhq.apps.googleusercontent.com'
  public oauthUnavailable: boolean = true
  public redirectUri: string = ''
  public testingUsername = 'testing@juice-sh.op'
  public testingPassword = 'IamUsedForTesting'
  constructor (private readonly configurationService: ConfigurationService, private readonly userService: UserService, private readonly windowRefService: WindowRefService, private readonly cookieService: CookieService, private readonly router: Router, private readonly formSubmitService: FormSubmitService, private readonly basketService: BasketService, private readonly ngZone: NgZone) { }

  ngOnInit (): void {
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
    this.configurationService.getApplicationConfiguration().subscribe({
      next: (config) => {
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
      },
      error: (err) => { console.log(err) }
    })

    this.formSubmitService.attachEnterKeyHandler('login-form', 'loginButton', () => { this.login() })
  }

  login () {
    this.user = {}
    this.user.email = this.emailControl.value
    this.user.password = this.passwordControl.value
    this.userService.login(this.user).subscribe({
      next: (authentication: any) => {
        localStorage.setItem('token', authentication.token)
        const expires = new Date()
        expires.setHours(expires.getHours() + 8)
        this.cookieService.put('token', authentication.token, { expires })
        sessionStorage.setItem('bid', authentication.bid)
        this.basketService.updateNumberOfCartItems()
        this.userService.isLoggedIn.next(true)
        this.ngZone.run(async () => await this.router.navigate(['/search']))
      },
      error: ({ error }) => {
        if (error.status && error.data && error.status === 'totp_token_required') {
          localStorage.setItem('totp_tmp_token', error.data.tmpToken)
          this.ngZone.run(async () => await this.router.navigate(['/2fa/enter']))
          return
        }
        localStorage.removeItem('token')
        this.cookieService.remove('token')
        sessionStorage.removeItem('bid')
        this.error = error
        this.userService.isLoggedIn.next(false)
        this.emailControl.markAsPristine()
        this.passwordControl.markAsPristine()
      }
    })

    if (this.rememberMe.value) {
      localStorage.setItem('email', this.user.email)
    } else {
      localStorage.removeItem('email')
    }
  }

  googleLogin () {
    this.windowRefService.nativeWindow.location.replace(`${oauthProviderUrl}?client_id=${this.clientId}&response_type=token&scope=email&redirect_uri=${this.redirectUri}`)
  }
}
