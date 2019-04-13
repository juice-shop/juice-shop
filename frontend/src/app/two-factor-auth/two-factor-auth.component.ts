import { Component } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'

import { TwoFactorAuthService } from '../Services/two-factor-auth-service'

@Component({
  selector: 'app-two-factor-auth',
  templateUrl: './two-factor-auth.component.html',
  styleUrls: ['./two-factor-auth.component.scss']
})
export class TwoFactorAuthComponent {
  public data: string

  public twoFactorSetupForm: FormGroup = new FormGroup({
    passwordControl: new FormControl(''),
    initalTokenControl: new FormControl('')
  })

  public setupStatus: boolean = null
  public totpUrl?: string

  public errored: boolean = null

  private setupToken?: string

  constructor (private twoFactorAuthService: TwoFactorAuthService) {}

  ngOnInit () {
    this.twoFactorAuthService.status().subscribe(({ setup, email, secret, setupToken }) => {
      this.setupStatus = setup
      if (setup === false) {
        this.totpUrl = `otpauth://totp/JuiceShop:${email}?secret=${secret}&issuer=JuiceShop`
        this.setupToken = setupToken
      }
    }, () => {
      console.log('Failed to fetch 2fa status')
    })
  }

  setup () {
    this.twoFactorAuthService.setup(
      this.twoFactorSetupForm.get('passwordControl').value,
      this.setupToken,
      this.twoFactorSetupForm.get('initalTokenControl').value
    ).subscribe(() => {
      this.setupStatus = true
    }, () => {
      this.errored = true
    })
  }
}
