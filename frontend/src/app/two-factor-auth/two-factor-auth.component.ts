import { Component } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'

import { TwoFactorAuthService } from '../Services/two-factor-auth-service'
import { ConfigurationService } from '../Services/configuration.service'

import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faUnlockAlt, faSave } from '@fortawesome/free-solid-svg-icons'

import { forkJoin } from 'rxjs'
import { TranslateService } from '@ngx-translate/core'
import { MatSnackBar } from '@angular/material/snack-bar'

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
    passwordControl: new FormControl('', [Validators.required]),
    initalTokenControl: new FormControl('', [Validators.required])
  })

  public twoFactorDisableForm: FormGroup = new FormGroup({
    passwordControl: new FormControl('', [Validators.required])
  })

  public setupStatus: boolean = null
  public totpUrl?: string
  public totpSecret?: string

  public errored: boolean = null

  private setupToken?: string

  private appName = 'OWASP Juice Shop'

  constructor (private twoFactorAuthService: TwoFactorAuthService, private configurationService: ConfigurationService, private snackBar: MatSnackBar, private translateService: TranslateService) {}

  ngOnInit () {
    this.updateStatus()
  }

  updateStatus () {
    const status = this.twoFactorAuthService.status()
    const config = this.configurationService.getApplicationConfiguration()

    forkJoin(status, config).subscribe(([{ setup, email, secret, setupToken }, config ]) => {
      this.setupStatus = setup
      this.appName = config.application.name
      if (setup === false) {
        const encodedAppName = encodeURIComponent(this.appName)
        this.totpUrl = `otpauth://totp/${encodedAppName}:${email}?secret=${secret}&issuer=${encodedAppName}`
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
      this.openSnackBar('CONFIRM_2FA_SETUP', 'Ok')
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
      this.openSnackBar('CONFIRM_2FA_DISABLE', 'Ok')
    }, () => {
      this.twoFactorDisableForm.get('passwordControl').markAsPristine()
      this.errored = true
    })
  }

  openSnackBar (message: string, action: string) { // TODO Pull out duplicated function and reuse in e.g. ErasureRequestComponent as well
    this.translateService.get(message).subscribe((translatedMessage) => {
      this.snackBar.open(translatedMessage, action, {
        duration: 5000
      })
    }, () => {
      this.snackBar.open(message, action, {
        duration: 5000
      })
    })
  }
}
