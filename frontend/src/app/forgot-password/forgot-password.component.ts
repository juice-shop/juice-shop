/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { UserService } from '../Services/user.service'
import { SecurityQuestionService } from '../Services/security-question.service'
import { type AbstractControl, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Component } from '@angular/core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { faEdit } from '@fortawesome/free-regular-svg-icons'
import { type SecurityQuestion } from '../Models/securityQuestion.model'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { PasswordStrengthComponent } from '../password-strength/password-strength.component'
import { PasswordStrengthInfoComponent } from '../password-strength-info/password-strength-info.component'
import { MatSlideToggle } from '@angular/material/slide-toggle'

import { MatTooltip } from '@angular/material/tooltip'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatSuffix, MatError, MatHint } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'

library.add(faSave, faEdit)

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [MatCardModule, TranslateModule, MatFormFieldModule, MatLabel, MatInputModule, FormsModule, ReactiveFormsModule, MatIconModule, MatSuffix, MatTooltip, MatError, MatHint, MatSlideToggle, PasswordStrengthComponent, PasswordStrengthInfoComponent, MatButtonModule]
})
export class ForgotPasswordComponent {
  public emailControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.email])
  public securityQuestionControl: UntypedFormControl = new UntypedFormControl({ disabled: true, value: '' }, [Validators.required])
  public passwordControl: UntypedFormControl = new UntypedFormControl({ disabled: true, value: '' }, [Validators.required, Validators.minLength(5)])
  public repeatPasswordControl: UntypedFormControl = new UntypedFormControl({ disabled: true, value: '' }, [Validators.required, matchValidator(this.passwordControl)])
  public securityQuestion?: string
  public error?: string
  public confirmation?: string
  public timeoutDuration = 1000
  private timeout

  constructor (private readonly securityQuestionService: SecurityQuestionService, private readonly userService: UserService, private readonly translate: TranslateService) { }

  findSecurityQuestion () {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.securityQuestion = undefined
      if (this.emailControl.value) {
        this.securityQuestionService.findBy(this.emailControl.value).subscribe({
          next: (securityQuestion: SecurityQuestion) => {
            if (securityQuestion) {
              this.securityQuestion = securityQuestion.question
              this.securityQuestionControl.enable()
              this.passwordControl.enable()
              this.repeatPasswordControl.enable()
            } else {
              this.securityQuestionControl.disable()
              this.passwordControl.disable()
              this.repeatPasswordControl.disable()
            }
          },
          error: (error) => error
        }
        )
      } else {
        this.securityQuestionControl.disable()
        this.passwordControl.disable()
        this.repeatPasswordControl.disable()
      }
    }, this.timeoutDuration)
  }

  resetPassword () {
    this.userService.resetPassword({
      email: this.emailControl.value,
      answer: this.securityQuestionControl.value,
      new: this.passwordControl.value,
      repeat: this.repeatPasswordControl.value
    }).subscribe({
      next: () => {
        this.error = undefined
        this.translate.get('PASSWORD_SUCCESSFULLY_CHANGED').subscribe({
          next: (passwordSuccessfullyChanged) => {
            this.confirmation = passwordSuccessfullyChanged
          },
          error: (translationId) => {
            this.confirmation = translationId
          }
        })
        this.resetForm()
      },
      error: (error) => {
        this.error = error.error
        this.confirmation = undefined
        this.resetErrorForm()
      }
    })
  }

  resetForm () {
    this.emailControl.setValue('')
    this.emailControl.markAsPristine()
    this.emailControl.markAsUntouched()
    this.securityQuestionControl.setValue('')
    this.securityQuestionControl.markAsPristine()
    this.securityQuestionControl.markAsUntouched()
    this.passwordControl.setValue('')
    this.passwordControl.markAsPristine()
    this.passwordControl.markAsUntouched()
    this.repeatPasswordControl.setValue('')
    this.repeatPasswordControl.markAsPristine()
    this.repeatPasswordControl.markAsUntouched()
  }

  resetErrorForm () {
    this.emailControl.markAsPristine()
    this.emailControl.markAsUntouched()
    this.securityQuestionControl.setValue('')
    this.securityQuestionControl.markAsPristine()
    this.securityQuestionControl.markAsUntouched()
    this.passwordControl.setValue('')
    this.passwordControl.markAsPristine()
    this.passwordControl.markAsUntouched()
    this.repeatPasswordControl.setValue('')
    this.repeatPasswordControl.markAsPristine()
    this.repeatPasswordControl.markAsUntouched()
  }
}

function matchValidator (passwordControl: AbstractControl) {
  return function matchOtherValidate (repeatPasswordControl: UntypedFormControl) {
    const password = passwordControl.value
    const passwordRepeat = repeatPasswordControl.value
    if (password !== passwordRepeat) {
      return { notSame: true }
    }
    return null
  }
}
