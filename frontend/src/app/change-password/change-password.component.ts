/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  type AbstractControl,
  UntypedFormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms'
import { UserService } from '../Services/user.service'
import { Component } from '@angular/core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { faEdit } from '@fortawesome/free-regular-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'

import { MatInputModule } from '@angular/material/input'
import {
  MatFormFieldModule,
  MatLabel,
  MatError,
  MatHint
} from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'

library.add(faSave, faEdit)

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  imports: [
    MatCardModule,
    TranslateModule,
    MatFormFieldModule,
    MatLabel,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatError,
    MatHint,
    MatButtonModule
  ]
})
export class ChangePasswordComponent {
  public passwordControl: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ])

  public newPasswordControl: UntypedFormControl = new UntypedFormControl('', [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(40)
  ])

  public repeatNewPasswordControl: UntypedFormControl = new UntypedFormControl(
    '',
    [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(40),
      matchValidator(this.newPasswordControl)
    ]
  )

  public error: any
  public confirmation: any

  constructor (
    private readonly userService: UserService,
    private readonly formSubmitService: FormSubmitService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit (): void {
    this.formSubmitService.attachEnterKeyHandler(
      'password-form',
      'changeButton',
      () => {
        this.changePassword()
      }
    )
  }

  changePassword () {
    if (
      localStorage.getItem('email')?.match(/support@.*/) &&
      !this.newPasswordControl.value.match(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,30}/
      )
    ) {
      console.error(
        'Parola echipei de asistență nu respectă politica corporativă pentru conturile privilegiate! Vă rugăm să schimbați parola în consecință!'
      )
    }
    this.userService
      .changePassword({
        current: this.passwordControl.value,
        new: this.newPasswordControl.value,
        repeat: this.repeatNewPasswordControl.value
      })
      .subscribe({
        next: () => {
          this.error = undefined
          this.translate.get('PASSWORD_SUCCESSFULLY_CHANGED').subscribe({
            next: (passwordSuccessfullyChanged) => {
              this.confirmation = passwordSuccessfullyChanged
            },
            error: (translationId) => {
              this.confirmation = { error: translationId }
            }
          })
          this.resetForm()
        },
        error: (error) => {
          console.log(error)
          this.error = error
          this.confirmation = undefined
          this.resetPasswords()
        }
      })
  }

  resetForm () {
    this.passwordControl.setValue('')
    this.resetPasswords()
  }

  resetPasswords () {
    this.passwordControl.markAsPristine()
    this.passwordControl.markAsUntouched()
    this.newPasswordControl.setValue('')
    this.newPasswordControl.markAsPristine()
    this.newPasswordControl.markAsUntouched()
    this.repeatNewPasswordControl.setValue('')
    this.repeatNewPasswordControl.markAsPristine()
    this.repeatNewPasswordControl.markAsUntouched()
  }
}

function matchValidator (newPasswordControl: AbstractControl) {
  return function matchOtherValidate (
    repeatNewPasswordControl: UntypedFormControl
  ) {
    const password = newPasswordControl.value
    const passwordRepeat = repeatNewPasswordControl.value
    if (password !== passwordRepeat) {
      return { notSame: true }
    }
    return null
  }
}
