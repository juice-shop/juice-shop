import { Component } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'

import { TwoFactorAuthService } from '../Services/two-factor-auth-service'

import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faUnlockAlt, faSave } from '@fortawesome/free-solid-svg-icons'

library.add(faUnlockAlt, faSave)
dom.watch()

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

  public twoFactorDisableForm: FormGroup = new FormGroup({
    passwordControl: new FormControl('')
  })

  public setupStatus: boolean = null
  public totpUrl?: string
  public totpSecret?: string

  public errored: boolean = null

  private setupToken?: string

  constructor (private twoFactorAuthService: TwoFactorAuthService) {}

  ngOnInit () {
    this.updateStatus()
  }

  updateStatus () {
    const status = this.twoFactorAuthService.status()
    status.subscribe(({ setup, email, secret, setupToken }) => {
      this.setupStatus = setup
      if (setup === false) {
        this.totpUrl = `otpauth://totp/JuiceShop:${email}?secret=${secret}&issuer=JuiceShop` // FIXME Use app name from config instead of fixed "JuiceShop"
        this.totpSecret = secret
        this.setupToken = setupToken
      }
    }, () => {
      console.log('Failed to fetch 2fa status')
    })
    return status
  }

  setup () {
    this.twoFactorAuthService.setup(
      this.twoFactorSetupForm.get('passwordControl').value,
      this.setupToken,
      this.twoFactorSetupForm.get('initalTokenControl').value
    ).subscribe(() => {
      this.setupStatus = true
    }, () => {
      this.twoFactorSetupForm.get('passwordControl').markAsPristine()
      this.twoFactorSetupForm.get('initalTokenControl').markAsPristine()
      this.errored = true
    })
  }

  disable () {
    this.twoFactorAuthService.disable(
      this.twoFactorDisableForm.get('passwordControl').value
    ).subscribe(() => {
      this.updateStatus().subscribe(
        () => {
          this.setupStatus = false
        }
      )
    }, () => {
      this.twoFactorDisableForm.get('passwordControl').markAsPristine()
      this.errored = true
    })
  }
}
