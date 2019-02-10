import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { TwoFactorAuthServiceService } from '../Services/two-factor-auth-service.service'
import { CookieService } from 'ngx-cookie'
import { UserService } from '../Services/user.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-two-factor-auth-enter',
  templateUrl: './two-factor-auth-enter.component.html',
  styleUrls: ['./two-factor-auth-enter.component.scss']
})
export class TwoFactorAuthEnterComponent {

  public tokenControl: FormControl = new FormControl('', [Validators.required])

  constructor (
    private twoFactorAuthService: TwoFactorAuthServiceService,
    private cookieService: CookieService,
    private userService: UserService,
    private router: Router
  ) { }

  verify () {
    const token = this.tokenControl.value

    this.twoFactorAuthService.verify(token).subscribe((authentication) => {
      localStorage.setItem('token', authentication.token)
      this.cookieService.put('token', authentication.token)
      sessionStorage.setItem('bid', authentication.bid.toString())
      /*Use userService to notifiy if user has logged in*/
      /*this.userService.isLoggedIn = true;*/
      this.userService.isLoggedIn.next(true)
      this.router.navigate(['/search'])
    })
  }

}
