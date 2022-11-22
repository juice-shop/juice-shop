/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'

import { TwoFactorAuthService } from '../Services/two-factor-auth-service'
import { ConfigurationService } from '../Services/configuration.service'

import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faSave, faUnlockAlt } from '@fortawesome/free-solid-svg-icons'

import { forkJoin } from 'rxjs'
import { TranslateService } from '@ngx-translate/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'

library.add(faUnlockAlt, faSave)
dom.watch()

@Component({
  selector: 'app-two-factor-auth',
  templateUrl: './two-factor-auth.component.html',
  styleUrls: ['./two-factor-auth.component.scss']
})
export class TwoFactorAuthComponent {
  public data?: string

  public twoFactorSetupForm: UntypedFormGroup = new UntypedFormGroup({
    passwordControl: new UntypedFormControl('', [Validators.required]),
    initalTokenControl: new UntypedFormControl('', [Validators.required, Validators.pattern('^[\\d]{6}$')])
  })

  public twoFactorDisableForm: UntypedFormGroup = new UntypedFormGroup({
    passwordControl: new UntypedFormControl('', [Validators.required])
  })

  public setupStatus: boolean | null = null
  public errored: boolean | null = null

  public totpUrl?: string
  public totpSecret?: string
  private setupToken?: string

  private appName = 'OWASP Juice Shop'

  constructor (private readonly twoFactorAuthService: TwoFactorAuthService, private readonly configurationService: ConfigurationService, private readonly snackBar: MatSnackBar, private readonly translateService: TranslateService, private readonly snackBarHelperService: SnackBarHelperService) {}

  ngOnInit () {
    this.updateStatus()
  }

  updateStatus () {
    const status = this.twoFactorAuthService.status()
    const config = this.configurationService.getApplicationConfiguration()

    forkJoin([status, config]).subscribe(([{ setup, email, secret, setupToken }, config]) => {
      this.setupStatus = setup
      this.appName = config.application.name
      if (!setup) {
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
      this.twoFactorSetupForm.get('passwordControl')?.value,
      this.twoFactorSetupForm.get('initalTokenControl')?.value,
      this.setupToken
    ).subscribe(() => {
      this.setupStatus = true
      this.snackBarHelperService.open('CONFIRM_2FA_SETUP')
    }, () => {
      this.twoFactorSetupForm.get('passwordControl')?.markAsPristine()
      this.twoFactorSetupForm.get('initalTokenControl')?.markAsPristine()
      this.errored = true
    })
  }

  disable () {
    this.twoFactorAuthService.disable(
      this.twoFactorDisableForm.get('passwordControl')?.value
    ).subscribe(() => {
      this.updateStatus().subscribe(
        () => {
          this.setupStatus = false
        }
      )
      this.snackBarHelperService.open('CONFIRM_2FA_DISABLE')
    }, () => {
      this.twoFactorDisableForm.get('passwordControl')?.markAsPristine()
      this.errored = true
    })
  }
}
