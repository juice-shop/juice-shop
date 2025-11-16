/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { SecurityAnswerService } from '../Services/security-answer.service'
import { UserService } from '../Services/user.service'
import { type AbstractControl, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Component, NgZone, type OnInit, inject } from '@angular/core'
import { SecurityQuestionService } from '../Services/security-question.service'
import { Router, RouterLink } from '@angular/router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { MatSnackBar } from '@angular/material/snack-bar'

import { faExclamationCircle, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { type SecurityQuestion } from '../Models/securityQuestion.model'
import { MatButtonModule } from '@angular/material/button'
import { MatOption } from '@angular/material/core'
import { MatSelect } from '@angular/material/select'
import { PasswordStrengthComponent } from '../password-strength/password-strength.component'
import { PasswordStrengthInfoComponent } from '../password-strength-info/password-strength-info.component'
import { MatSlideToggle } from '@angular/material/slide-toggle'

import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatError, MatHint } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'

import { MatIconModule } from '@angular/material/icon'

library.add(faUserPlus, faExclamationCircle)

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [MatCardModule, TranslateModule, MatFormFieldModule, MatLabel, MatInputModule, FormsModule, ReactiveFormsModule, MatError, MatHint, MatSlideToggle, PasswordStrengthComponent, PasswordStrengthInfoComponent, MatSelect, MatOption, MatButtonModule, RouterLink, MatIconModule]
})
export class RegisterComponent implements OnInit {
  private readonly securityQuestionService = inject(SecurityQuestionService);
  private readonly userService = inject(UserService);
  private readonly securityAnswerService = inject(SecurityAnswerService);
  private readonly router = inject(Router);
  private readonly formSubmitService = inject(FormSubmitService);
  private readonly translateService = inject(TranslateService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly snackBarHelperService = inject(SnackBarHelperService);
  private readonly ngZone = inject(NgZone);

  public emailControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.email])
  public passwordControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(40)])
  public repeatPasswordControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, matchValidator(this.passwordControl)])
  public securityQuestionControl: UntypedFormControl = new UntypedFormControl('', [Validators.required])
  public securityAnswerControl: UntypedFormControl = new UntypedFormControl('', [Validators.required])
  public securityQuestions!: SecurityQuestion[]
  public selected?: number
  public error: string | null = null

  ngOnInit (): void {
    this.securityQuestionService.find(null).subscribe({
      next: (securityQuestions: any) => {
        this.securityQuestions = securityQuestions
      },
      error: (err) => { console.log(err) }
    })

    this.formSubmitService.attachEnterKeyHandler('registration-form', 'registerButton', () => { this.save() })
  }

  save () {
    const user = {
      email: this.emailControl.value,
      password: this.passwordControl.value,
      passwordRepeat: this.repeatPasswordControl.value,
      securityQuestion: this.securityQuestions.find((question) => question.id === this.securityQuestionControl.value),
      securityAnswer: this.securityAnswerControl.value
    }

    this.userService.save(user).subscribe({
      next: (response: any) => {
        this.securityAnswerService.save({
          UserId: response.id,
          answer: this.securityAnswerControl.value,
          SecurityQuestionId: this.securityQuestionControl.value
        }).subscribe(() => {
          this.ngZone.run(async () => await this.router.navigate(['/login']))
          this.snackBarHelperService.open('CONFIRM_REGISTER')
        })
      },
      error: (err) => {
        console.log(err)
        if (err.error?.errors) {
          const error = err.error.errors[0]
          if (error.message) {

            this.error = error.message[0].toUpperCase() + error.message.slice(1)
          } else {
            this.error = error
          }
        }
      }
    })
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
