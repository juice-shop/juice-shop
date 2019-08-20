import { CookieService } from 'ngx-cookie'
import { WindowRefService } from '../Services/window-ref.service'
import { Router } from '@angular/router'
import { Component, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { UserService } from '../Services/user.service'
import { faKey, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'

library.add(faKey, faEye, faEyeSlash, faGoogle)
dom.watch()

const oauthProviderUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
const clientId = '1005568560502-6hm16lef8oh46hr2d98vf2ohlnj4nfhq.apps.googleusercontent.com'

const authorizedRedirectURIs: any = {
  'http://demo.owasp-juice.shop': 'http://demo.owasp-juice.shop',
  'https://juice-shop.herokuapp.com': 'https://juice-shop.herokuapp.com',
  'http://juice-shop.herokuapp.com': 'http://juice-shop.herokuapp.com',
  'http://preview.owasp-juice.shop': 'http://preview.owasp-juice.shop',
  'https://juice-shop-staging.herokuapp.com': 'https://juice-shop-staging.herokuapp.com',
  'http://juice-shop-staging.herokuapp.com': 'http://juice-shop-staging.herokuapp.com',
  'http://juice-shop.wtf': 'http://juice-shop.wtf',
  'http://localhost:3000': 'http://local3000.owasp-juice.shop',
  'http://127.0.0.1:3000': 'http://local3000.owasp-juice.shop',
  'http://localhost:4200': 'http://local4200.owasp-juice.shop',
  'http://127.0.0.1:4200': 'http://local4200.owasp-juice.shop',
  'http://192.168.99.100:3000': 'http://localMac.owasp-juice.shop'
}

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
  public oauthUnavailable: boolean = true
  public redirectUri: string = ''
  constructor (private userService: UserService, private windowRefService: WindowRefService, private cookieService: CookieService, private router: Router, private formSubmitService: FormSubmitService) { }

  ngOnInit () {
    const email = localStorage.getItem('email')
    if (email) {
      this.user = {}
      this.user.email = email
      this.rememberMe.setValue(true)
    } else {
      this.rememberMe.setValue(false)
    }

    this.redirectUri = this.windowRefService.nativeWindow.location.protocol + '//' + this.windowRefService.nativeWindow.location.host
    this.oauthUnavailable = !authorizedRedirectURIs[this.redirectUri]
    if (this.oauthUnavailable) {
      console.log(this.redirectUri + ' is not an authorized redirect URI for this application.')
    }

    this.formSubmitService.attachEnterKeyHandler('login-form', 'loginButton', () => this.login())
  }

  login () {
    this.user = {}
    this.user.email = this.emailControl.value
    this.user.password = this.passwordControl.value
    this.userService.login(this.user).subscribe((authentication: any) => {
      localStorage.setItem('token', authentication.token)
      this.cookieService.put('token', authentication.token)
      sessionStorage.setItem('bid', authentication.bid)
      this.userService.isLoggedIn.next(true)
      this.router.navigate(['/search'])
    }, ({ error }) => {
      if (error.status && error.data && error.status === 'totp_token_requried') {
        localStorage.setItem('totp_tmp_token', error.data.tmpToken)
        this.router.navigate(['/2fa/enter'])
        return
      }
      localStorage.removeItem('token')
      this.cookieService.remove('token')
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
    this.windowRefService.nativeWindow.location.replace(oauthProviderUrl + '?client_id='
      + clientId + '&response_type=token&scope=email&redirect_uri='
      + authorizedRedirectURIs[this.redirectUri])
  }

}
