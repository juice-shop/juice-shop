import { CookieService } from 'ngx-cookie'
import { WindowRefService } from '../Services/window-ref.service'
import { Router } from '@angular/router'
import { Component, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { UserService } from '../Services/user.service'
import { faKey, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import { pressEnterHandler } from 'src/functions'

library.add(faKey, faEye, faEyeSlash, faGoogle)
dom.watch()

const oauthProviderUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
const clientId = '1005568560502-6hm16lef8oh46hr2d98vf2ohlnj4nfhq.apps.googleusercontent.com'

const authorizedRedirectURIs = {
  'http://demo.owasp-juice.shop': 'http://demo.owasp-juice.shop',
  'https://juice-shop.herokuapp.com': 'https://juice-shop.herokuapp.com',
  'http://juice-shop.herokuapp.com': 'http://juice-shop.herokuapp.com',
  'http://preview.owasp-juice.shop': 'http://preview.owasp-juice.shop',
  'https://juice-shop-staging.herokuapp.com': 'https://juice-shop-staging.herokuapp.com',
  'http://juice-shop-staging.herokuapp.com': 'http://juice-shop-staging.herokuapp.com',
  'http://localhost:3000': 'http://local3000.owasp-juice.shop',
  'http://127.0.0.1:3000': 'http://local3000.owasp-juice.shop',
  'http://localhost:4200': 'http://local4200.owasp-juice.shop',
  'http://127.0.0.1:4200': 'http://local4200.owasp-juice.shop',
  'http://192.168.99.100:3000': 'http://localMac.owasp-juice.shop',
  'https://juice-shop-v8.herokuapp.com': 'https://juice-shop-v8.herokuapp.com',
  'http://juice-shop-v8.herokuapp.com': 'http://juice-shop-v8.herokuapp.com'
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
  public oauthUnavailable: any
  public redirectUri
  constructor (private userService: UserService, private windowRefService: WindowRefService, private cookieService: CookieService, private router: Router) { }

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

    pressEnterHandler('login-form', () => this.login(), this.isEnabled)
  }

  isEnabled () {
    return (document.getElementById('loginButton') as HTMLInputElement).disabled
  }

  login () {

    this.user = {}
    this.user.email = this.emailControl.value
    this.user.password = this.passwordControl.value
    this.userService.login(this.user).subscribe((authentication: any) => {
      localStorage.setItem('token', authentication.token)
      this.cookieService.put('token', authentication.token)
      sessionStorage.setItem('bid', authentication.bid)
      /*Use userService to notifiy if user has logged in*/
      /*this.userService.isLoggedIn = true;*/
      this.userService.isLoggedIn.next(true)
      this.router.navigate(['/search'])
    }, (error) => {
      console.log(error)
      localStorage.removeItem('token')
      this.cookieService.remove('token', { domain: document.domain })
      sessionStorage.removeItem('bid')
      this.error = error
      /* Use userService to notify user failed to log in */
      /*this.userServe.isLoggedIn = false;*/
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
